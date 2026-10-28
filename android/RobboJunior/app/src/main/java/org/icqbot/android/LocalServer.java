package org.icqbot.android;

import fi.iki.elonen.NanoHTTPD;

import android.content.Context;

import java.io.InputStream;

public class LocalServer extends NanoHTTPD {

    private Context context;

    public LocalServer(Context context) {
        super(8080); // 端口
        this.context = context;
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();   // /HTML5/ai/face.html

        try {
            if (uri.equals("/")) {
                uri = "/HTML5/ai/face.html";
            }

            // 去掉开头 /
            String assetPath = uri.substring(1);

            InputStream is = context.getAssets().open(assetPath);

            String mime = getMimeType(assetPath);

            return newFixedLengthResponse(Response.Status.OK, mime, is, is.available());

        } catch (Exception e) {
            e.printStackTrace();
            return newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "404");
        }
    }

    private String getMimeType(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".wasm")) return "application/wasm"; // ⭐关键
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".png")) return "image/png";
        if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
        return "text/plain";
    }
}
