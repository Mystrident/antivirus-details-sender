import Registry from "winreg";
const REG_PATH = "\\SOFTWARE\\WOW6432Node\\Endpoint\\Agent";
function readRegistryValue(name) {
    return new Promise((resolve) => {
        const regKey = new Registry({
            hive: Registry.HKLM,
            key: REG_PATH,
        });
        regKey.get(name, (err, item) => {
            if (err || !item) {
                resolve(null);
            }
            else {
                resolve(item.value.trim());
            }
        });
    });
}
export async function getInstallerConfig() {
    return {
        serverUrl: await readRegistryValue("ServerUrl"),
        apiKey: await readRegistryValue("ApiKey"),
        assetId: await readRegistryValue("AssetId"),
        username: await readRegistryValue("Username"),
        location: await readRegistryValue("Location"),
    };
}
