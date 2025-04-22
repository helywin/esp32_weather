# CHAT

## ESP32 设备配置存储

在没有 SD 卡的情况下，可以直接用 ESP32 的内部 Flash 来存储配置，常用的方法有：

1. NVS（Non‑Volatile Storage，IDF 原生）  
2. SPIFFS / LittleFS（文件系统方式）  
3. Arduino 下的 Preferences 库（基于 NVS 封装）

下面给出两个最常见的示例。

1) ESP‑IDF 下用 NVS 存取字符串／数值  
````cpp
#include "nvs_flash.h"
#include "nvs.h"

void init_nvs() {
    esp_err_t err = nvs_flash_init();
    if (err == ESP_ERR_NVS_NO_FREE_PAGES
     || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        nvs_flash_erase();
        nvs_flash_init();
    }
}

void save_config(const char* key, const char* value) {
    nvs_handle_t handle;
    nvs_open("storage", NVS_READWRITE, &handle);
    nvs_set_str(handle, key, value);
    nvs_commit(handle);
    nvs_close(handle);
}

String load_config(const char* key, const char* default_val) {
    nvs_handle_t handle;
    size_t required_size;
    nvs_open("storage", NVS_READONLY, &handle);
    // 先查询需要多大空间
    nvs_get_str(handle, key, NULL, &required_size);
    char* buf = (char*)malloc(required_size);
    esp_err_t err = nvs_get_str(handle, key, buf, &required_size);
    String result = (err == ESP_OK) ? String(buf) : String(default_val);
    free(buf);
    nvs_close(handle);
    return result;
}

// 用法示例
void app_main() {
    init_nvs();
    save_config("wifi_ssid", "myssid");
    String ssid = load_config("wifi_ssid", "default_ssid");
    printf("SSID: %s\n", ssid.c_str());
}
````

2) Arduino 框架下用 Preferences 存取  
````cpp
#include <Preferences.h>

Preferences prefs;

void setup() {
  Serial.begin(115200);
  prefs.begin("weather_cfg", false);  // false=读写，true=只读

  // 存储配置
  prefs.putString("city_id", "101250101");
  prefs.putInt("update_interval", 60);

  // 读取配置
  String city = prefs.getString("city_id", "101010100");
  int interval = prefs.getInt("update_interval", 30);
  Serial.printf("City: %s, Interval: %d\n", city.c_str(), interval);

  prefs.end();
}

void loop() {
  // ...
}
````

任选其一，均无需插 SD 卡就能将配置持久化到内置 Flash。
