package com.example.hlupean.eventsimple.controller;


import android.app.Activity;

import com.example.hlupean.eventsimple.net.NetController;

import java.util.Date;

public class ControllerAuth
{
    private static ControllerAuth instance = null;
    private NetController net;
    private Activity context;

    public static ControllerAuth getInstance()
    {
        if (null == instance)
        {
            instance = new ControllerAuth();
        }

        return instance;
    }

    private ControllerAuth()
    {
        this.net = NetController.getInstance();
    }

    public void setContext(Activity context)
    {
        this.context = context;
    }

    public void Login(String username, String password)
    {
        this.net.Login(username, password);
    }

    public void Register(String username, String password, String mail, String city, Date date, boolean isOrg)
    {
        this.net.Register(username, password, mail, city, date, isOrg);
    }
}
