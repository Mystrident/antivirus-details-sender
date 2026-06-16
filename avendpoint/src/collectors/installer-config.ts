import Registry from "winreg";

const REG_PATH = "\\SOFTWARE\\YourCompany\\Agent";

function readRegistryValue(name: string): Promise<string | null> {
  return new Promise((resolve) => {
    const regKey = new Registry({
      hive: Registry.HKLM,
      key: REG_PATH,
    });

    regKey.get(name, (err, item) => {
      if (err || !item) {
        resolve(null);
      } else {
        resolve(item.value.trim());
      }
    });
  });
}

export async function getInstallerConfig() {
  return {
    assetId: await readRegistryValue("AssetId"),

    location: await readRegistryValue("Location"),
  };
}
