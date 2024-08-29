

function requestConfigUpdate({configStore}) {

        console.log('App requesting config udpate');
        // return the data
        return {
            config: configStore.getConfig(),
            isBackup: configStore.isUsingBackupConfig,
            lastUpdated: configStore.lastUpdated,
            error: configStore.loadError,
        }
}

module.exports = requestConfigUpdate;