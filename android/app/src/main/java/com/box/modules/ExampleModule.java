package com.box.modules;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.util.Optional;

public class ExampleModule extends ReactContextBaseJavaModule {
    public ExampleModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ExampleModule";
    }

    @ReactMethod
    public void getHTML(String url, Promise promise) {

        try {
            Document document = Jsoup.connect(url).userAgent("\"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 OPR/26.0.1656.60\"").get();
            String html = document.toString();
            promise.resolve(html);
        } catch (IOException e) {
            promise.reject("html 获取失败");
        }

    }
    @ReactMethod
    public void getHTML(String url, String ua, Promise promise) {

        try {
            Document document = Jsoup.connect(url).userAgent(ua).get();
            String html = document.toString();
            promise.resolve(html);
        } catch (IOException e) {
            promise.reject("html 获取失败");
        }

    }
}
