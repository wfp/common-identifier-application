const path = require('node:path');

function requestConfigUpdate({configStore}) {

        console.log('[IPC] [requestConfigUpdate] App requesting config udpate');
        // return the data
        return {
            config: configStore.getConfig(),
            isBackup: configStore.isUsingBackupConfig,
            lastUpdated: configStore.lastUpdated,
            error: configStore.loadError,
            hasAcceptedTermsAndConditions: configStore.hasAcceptedTermsAndConditions(),
        }
}

module.exports = requestConfigUpdate;