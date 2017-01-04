package com.example.hlupean.eventsimple.net;

import com.example.hlupean.eventsimple.domain.Event;

public class NetController
{
    private final String apiUrl = "http://192.168.56.1:3000/api";
    private final String authUrl = apiUrl + "/auth";



    public String Login(String username, String password)
    {
        String url = authUrl + "/session";

        return null;
    }
}
