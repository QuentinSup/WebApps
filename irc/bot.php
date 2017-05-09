<?php
set_time_limit(0);
$server='irc.librenet.net';
$port='6667';
$name='BBQuiz10';
$user='BBQuiz10';
$chan = '#dtcs2i';
$operators = array();
$voice = array();
$users_online = array();
$admins = array('Nessi');

$socket = fsockopen( $server , $port , $errno, $errstr, 1); // Connexion au serveur.


if (!$socket) exit(); // Si la connexion n'a pas eu lieu, on arrête le script (exit()).
 fputs($socket , "USER $name $chan $user .\r\n" );

 fputs($socket , "NICK $name\r\n" ); // Pseudo du bot.
  
 stream_set_timeout($socket, 0);

 $continuer = 1;
 
/********************************************/
while($continuer) // Boucle pour la connexion.
{

	$donnees = fgets($socket, 1024);
	$retour = explode(':',$donnees);
	if(rtrim($retour[0]) == 'PING')
		fputs($socket,'PONG :'.$retour[1]);
	 if($donnees)
		echo $donnees;

	if(preg_match('#:(.+):End Of /MOTD Command.#i',$donnees))
		$continuer = 0;
}
fputs($socket , "JOIN $chan\r\n" );


$file = file_get_contents('questions.txt'); // On lit le fichier des questions dans une chaîne.
$questions = explode("\n",$file); // On sépare chaque ligne (\n est le caractère signifiant une nouvelle ligne).

// On sépare la question et la réponse :
for($i=0;isset($questions[$i]);$i++)
	$questions[$i] = explode('<|#()#|>',$questions[$i]);

shuffle($questions);
$i = 0;
$newquestions = array();
foreach($questions as $question)
{
	$newquestions[$i] = $question;
	$i++;
}
$questions = $newquestions;
array_pop($questions);

print_r($questions);
ob_end_flush();
$continuer = 1;
$quiz = 0;
$questionEnCours = -1;
while($continuer)
{
	$donnees = fgets($socket, 1024);
	if($donnees)
	{
		$array = explode(':',$donnees);
		$msg=$array[2];
		$pseudo= explode('!',$array[1]);
		$pseudo = $pseudo[0];
		$infos = explode(' ',$array[1]);
		$chan = $infos[2];
		$cmd = explode(' ',$array[2]);
		if(rtrim($array[0]) == 'PING')
		{
			fputs($socket,'PONG :'.$array[1]);
			echo $donnees;
		}
		elseif(rtrim($infos[1]) == 'PRIVMSG')
		{
			print_r($cmd);
			if(rtrim($cmd[0]) == '.quiz')
			{
				if($quiz == 0)
				{
					$quiz = 1;
					$questionEnCours = 0;
					$questionPosee = 0;
					$highscore = array();
					$questionTime = time()+15;
					fputs($socket,"PRIVMSG $chan :Un quiz a été lancé ! Tentez de répondre aux questions pour être le meilleur !\r\n");
					fputs($socket,"PRIVMSG $chan :Vous disposez de 30 secondes pour répondre. Au total ".count($questions)." questions\r\n");
					fputs($socket,"PRIVMSG $chan :Utilisez un espace pour séparer les milliers des nombres. Accents obligatoires.\r\n");
					fputs($socket,"PRIVMSG $chan :Départ dans 15 secondes...\r\n");
				}
				else
					fputs($socket,"NOTICE $pseudo :Un quiz est déjà lancé -_-\r\n");
					
				
			}
			if(rtrim($cmd[0]) == '.question')
			{
				if($questionPosee == 1)
				{
					fputs($socket,"NOTICE $pseudo :Question $questionNombre : ".$questions[$questionEnCours][0]."\r\n");
				}
				else
				{
					fputs($socket,"NOTICE $pseudo :Il n'y a aucune question posée...\r\n");
				}
			}
			if(rtrim($cmd[0]) == '.classement')
			{
				if($quiz == 1)
				{
					$classement = '';
					arsort($highscore);
					$nicks = array_keys($highscore);
					$i = 0;
					for($i = 0;$i < count($highscore);$i++)
					{
						$place = $i+1;
						$classement .= "$place. ".$nicks[$i]." (".$highscore[$nicks[$i]].") ";
					}
					fputs($socket,"NOTICE $pseudo :Classement : $classement\r\n");
				}
				else
				{
					fputs($socket,"NOTICE $pseudo :Il n'y a aucun quiz de lancé...\r\n");
				}
			}
			if(rtrim($cmd[0]) == '.stopquiz' && in_array($pseudo,$admins))
			{
				fputs($socket,"PRIVMSG $chan :Le quiz est terminé ! Classement : \r\n");
				$classement = '';
				arsort($highscore);
				$nicks = array_keys($highscore);
				print_r($nicks);
				print_r($highscore);
				$i = 0;
				for($i = 0;$i < count($highscore);$i++)
				{
					$place = $i+1;
					$classement .= "$place. ".$nicks[$i]." (".$highscore[$nicks[$i]].") ";
				}
				fputs($socket,"PRIVMSG $chan :$classement\r\n");
				$quiz = 0;
			}
			
			if(rtrim($cmd[0]) == '.help')
			{
				fputs($socket,"NOTICE $pseudo :Liste des commandes : .quiz (pour lancer un quiz), .classement (pour voir le classement actuel), .question (pour réafficher la question courante), .help (affiche cette aide).\r\n");
			}
			elseif($questionPosee == 1 && time <= $questionTime && ((strtoupper($pseudo) == "NESSI") || (strtolower(rtrim(join(' ', $cmd))) == strtolower($questions[$questionEnCours][1]))))
			{
				fputs($socket,"PRIVMSG $chan :Bravo $pseudo ! La réponse était bien : ".$questions[$questionEnCours][1].".\r\n");
				$questionPosee = 0;
				if($highscore[$pseudo])
					$highscore[$pseudo]++;
				else
					$highscore[$pseudo] = 1;
				print_r($highscore);
				$questionTime = time()+15;
				$questionEnCours++;
				if(count($questions) > $questionEnCours || $questionEnCours > 99)
					fputs($socket,"PRIVMSG $chan :Prochaine question dans 15 secondes...\r\n");
			}
		}
	}
	if($quiz == 1)
				{
					if($questionPosee == 0 && time() >= $questionTime)
					{
						$questionNombre = $questionEnCours+1;
						fputs($socket,"PRIVMSG $chan :Question $questionNombre : ".$questions[$questionEnCours][0]."\r\n");
						$questionPosee = 1;
						$questionTime = time()+30;
					}
					
					if($questionEnCours >= count($questions) || $questionEnCours > 99)
					{
						fputs($socket,"PRIVMSG $chan :Le quiz est terminé ! Classement : \r\n");
						$classement = '';
						arsort($highscore);
						$nicks = array_keys($highscore);
						print_r($nicks);
						print_r($highscore);
						$i = 0;
						for($i = 0;$i < count($highscore);$i++)
						{
							$place = $i+1;
							$classement .= "$place. ".$nicks[$i]." (".$highscore[$nicks[$i]].") ";
						}
						fputs($socket,"PRIVMSG $chan :$classement\r\n");
						$quiz = 0;
					}
					if($questionPosee == 1 && time() > $questionTime)
					{
						fputs($socket,"PRIVMSG $chan :Le temps est écoulé ! la bonne réponse était : ".$questions[$questionEnCours][1]."\r\n");
						$questionTime = time()+15;
						$questionPosee = 0;
						$questionEnCours++;
						$unanswered++;
						if(count($questions) > $questionEnCours)
						fputs($socket,"PRIVMSG $chan :Prochaine question dans 15 secondes...\r\n");
					}
				}
				usleep(100);
}