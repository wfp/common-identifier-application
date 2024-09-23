const path = require('node:path');

function requestConfigUpdate({configStore}) {

        console.log('[IPC] [requestConfigUpdate] App requesting config udpate');

        const config = configStore.getConfig();
        // return the data
        return {
            config,
            isBackup: configStore.isUsingBackupConfig,
            lastUpdated: configStore.lastUpdated,
            error: configStore.loadError,
            hasAcceptedTermsAndConditions: configStore.hasAcceptedTermsAndConditions(),
        }
}

module.exports = requestConfigUpdate;