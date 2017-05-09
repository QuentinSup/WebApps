var webapp;
(function (webapp) {
    var keepintouch;
    (function (keepintouch) {
        var Application = kit.Application;
        var Logger = kit.helpers.Logger;
        var GlassPanel = kit.ui.GlassPanel;
        var Query = kit.helpers.Query;
        window.app = new Application();
        var oLogger_ = Logger.getLogger('main');
        oLogger_.debug("Démarrage de l'application");
        app.i18n.ready(function () {
            if (!app.isReady()) {
                GlassPanel.create('waitingAppIsReady', { text: app.i18n.getObservableString('app.panel.waitingAppIsReady')() });
            }
            Query.isBusy.immediateSubscribe(function (b) {
                if (b) {
                    GlassPanel.create('queryIsBusy', { text: app.i18n.getObservableString('app.query.busy.text')() });
                }
                else {
                    GlassPanel.destroy('queryIsBusy');
                }
            });
        });
        app.ready(function () {
            GlassPanel.destroy('waitingAppIsReady');
            $('#app').addClass('ready');
            oLogger_.info("L'application est prête");
        });
    })(keepintouch = webapp.keepintouch || (webapp.keepintouch = {}));
})(webapp || (webapp = {}));
//# sourceMappingURL=app.js.map