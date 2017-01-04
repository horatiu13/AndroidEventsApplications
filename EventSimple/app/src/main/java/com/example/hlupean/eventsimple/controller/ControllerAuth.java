package com.example.hlupean.eventsimple.controller;


import com.example.hlupean.eventsimple.net.NetController;

public class ControllerAuth
{
    private NetController net;

    public ControllerAuth(NetController net)
    {
        this.net = net;
//        this.repo = new NetController();
    }

    public String Login(String username, String password)
    {
        return this.net.Login(username, password);
//        if (username.equals("admin") && password.equals("admin"))
//        {
//            return null;
//        }
//
//        return "Wrong credentials";
    }

}
