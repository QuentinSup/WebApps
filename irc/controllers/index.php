<?php

namespace template;

include_once('dwSocket.php');

use dw\dwFramework as dw;
use dw\accessors\request;
use dw\accessors\ary;
use dw\accessors\session;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwLogger;
use dw\classes\dwObject;
use dw\classes\dwSocket;
use dw\classes\controllers\dwBasicController;



/**
 * Gestion des vols
 * @Mapping(value = '/')
 */
class index extends dwBasicController
{
	
	private static $_handler;
	private static $_oldSize;
	
		// Logger
	private static function logger() {
		static $logger = null;
		if(is_null($logger)) {
			$logger = dwLogger::getLogger(__CLASS__);
		}
		return $logger;
	}
	
	
	
	public function __construct() {}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/chan/:adress/:chan', method = "get", produces = 'text/html; charset=utf8')
	 */
	public function connect(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		//session::set('sockets', []);
		$channels = session::get('channels', []);

		$adressPath = explode('@', $request -> Path('adress'));
		$ADRESS		= $adressPath[0];
		$USERNAME 	= ary::get($adressPath, 1, "Unknownmen");
		$CHAN 		= $request -> Path('chan');
		
		if(isset($channels[$CHAN])) {
			$channel = $channels[$CHAN];
		} else {
			$channel = [];
		}
		
		$channel['adress'] 		= $ADRESS;
		$channel['username'] 	= $USERNAME;
		$channel['chan'] 		= $CHAN;
		
		$channels[$CHAN] = $channel;
		session::set('channels', $channels);
		
		if($socket = $this -> connectToChan($channel)) {
			$this -> listen($socket, $channel);
		}

	}
	
	private function connectToChan($channel) {

		if(is_string($channel)) {
			$channel = ary::get(session::get('channels'), $channel);
		}
		
		$socket = new dwSocket();
		if($socket -> connect($channel['adress'], 6667)) {
			return $socket;	
		}
		
		return null;
		
	}
		
	private function listen($socket, $channel) {
		
		if(is_string($channel)) {
			$channel = ary::get(session::get('channels'), $channel);
		}
		
		$USERNAME 	= $channel['username']."__";
		$CHAN 		= $channel['chan'];

		set_time_limit(0);
		
		$socket -> send("USER $USERNAME $CHAN $USERNAME .\r\n" );
		$socket -> send("NICK $USERNAME\r\n" ); // Pseudo du bot.

		
		$session = [
			"channel" => $channel
		];
		$dataToSave = true;
		// close session to release lock
		session_write_close();
				
		ary::set($session, 'alive', true);

		while(ary::get($session, 'alive', false)) {

			$data = $socket -> read();
			if($data) {
			
				$dataToSave = true;
				
				if(self::logger() -> isTraceEnabled()) {
					self::logger() -> trace($data);
				}

				$content = ary::get($session, 'unreadContent', '');
				ary::set($session, 'unreadContent', $content.$data);
				
				$cmd = explode(' :', $data);

				if($cmd[0] == "PING") {
					$socket -> send("PONG : ".$cmd[1]."\r\n");
				}

				if(preg_match('#:(.+):End Of /MOTD Command.#i', $data)) {
					$socket -> send("JOIN $CHAN\r\n" );
				}

				if($cmd[0] == "ERROR") {
					break;	
				}
				
			}
			
			$pulling = ary::get($session, 'pull');
			if($pulling) {
				ary::set($session, 'pull', '');
				$socket -> send($pulling);
				$dataToSave = true;
			}
			
			if($dataToSave) {
				self::saveData($session);
				$dataToSave = false;
			} else {
				if(self::$_handler) {
					fclose(self::$_handler);
					self::$_handler = null;
				}
			}
			
			usleep(500);
			
			$session = self::loadData($session);

		}
		
		ary::set($session, 'alive', false);
		self::saveData($session);
		
	}
	
	/**
	 * 
	 */
	public static function loadData($session = []) {
		
		$filename = "session".session_id().".irc";
		
		@clearstatcache(false, $filename);
		$size = filemtime($filename);
		
		if($size == self::$_oldSize) {
			return $session;
		}
		
		self::$_oldSize = $size;
		
		if(self::$_handler) {
			fclose(self::$_handler);
		}
		$data = [];
		$handler = fopen($filename, 'c+');
		if(flock($handler, LOCK_EX)) {
			self::$_handler = $handler;
			$data = "";
			while(!feof($handler)) {
				$data .= fread($handler, 1024);
			}
			$data = unserialize($data);	
		} else {
			echo "RRRRRRRRRRRr";
		}

		return $data;
	}
	
	public static function saveData($data) {
		$filename = "session".session_id().".irc";
		if(!self::$_handler) {
			self::$_handler = fopen($filename, 'w');
			if(!flock(self::$_handler, LOCK_EX)) {
				echo "RRRRRRRRRRRr2";
			}
		} else {
			ftruncate(self::$_handler, 0);
			rewind(self::$_handler);
		}
		$data = serialize($data);
		$ilen = strlen($data);
		$iwrite = 0;
		while($iwrite < $ilen) {
			$iwrite += fwrite(self::$_handler, $data);
		}
		fclose(self::$_handler);	
		clearstatcache(false, $filename);
		self::$_oldSize = filemtime($filename);
		self::$_handler = null;
	}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/chan/:chan', method = "get", produces = 'text/html; charset=utf8')
	 */
	public function getUnreadContent(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$session = self::loadData();
		$content = ary::get($session, 'unreadContent');
		ary::set($session, 'unreadContent', '');
		self::saveData($session);
		return $content;
	}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/chan/:chan/pull/:text', method = "get", produces = 'application/json; charset=utf8')
	 */
	public function pull(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$data = $request -> Path('text');
		$chan = $request -> Path('chan');
		$session = self::loadData();
		$content = ary::get($session, 'pull', '');
		ary::set($session, 'pull', $content."PRIVMSG ".$chan." :".urldecode($data)."\r\n");
		self::saveData($session);
	}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/cmd/:cmd', method = "get", produces = 'application/json; charset=utf8')
	 */
	public function cmd(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$data = $request -> Path('cmd');
		$session = self::loadData();
		$content = ary::get($session, 'pull', '');
		ary::set($session, 'pull', urldecode($data)."\r\n");
		self::saveData($session);
	}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/chan/:chan/kill', method = "get", produces = 'application/json; charset=utf8')
	 */
	public function disconnect(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$chan = $request -> Path('chan');
		$session = self::loadData();
		ary::set($session, 'alive', false);
		self::saveData($session);
	}

}
	
?>