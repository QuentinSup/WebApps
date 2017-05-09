module webapp.keepintouch {
   
    import Application = kit.Application;
    import Logger = kit.helpers.Logger;
    import GlassPanel = kit.ui.GlassPanel;
    import Query = kit.helpers.Query;
    
    window.app = new Application();

    var oLogger_: Logger = Logger.getLogger('main');
    oLogger_.debug("Démarrage de l'application");

    app.i18n.ready((): void => {
            
        if(!app.isReady()) {
            GlassPanel.create('waitingAppIsReady', { text: app.i18n.getObservableString('app.panel.waitingAppIsReady')() });
        }
        
        Query.isBusy.immediateSubscribe((b: boolean): void => {
            if(b) {
                GlassPanel.create('queryIsBusy', { text: app.i18n.getObservableString('app.query.busy.text')() });
            } else {
                GlassPanel.destroy('queryIsBusy');    
            }
        });
        
    })

    app.ready(function() {
            
        GlassPanel.destroy('waitingAppIsReady');
        $('#app').addClass('ready');                
        oLogger_.info("L'application est prête");

    });
    
 
}