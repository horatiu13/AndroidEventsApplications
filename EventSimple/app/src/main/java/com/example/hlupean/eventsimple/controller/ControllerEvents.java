package com.example.hlupean.eventsimple.controller;

import android.app.Activity;
import android.support.v4.app.Fragment;

import com.example.hlupean.eventsimple.domain.Event;
import com.example.hlupean.eventsimple.dummy.DummyContent;
import com.example.hlupean.eventsimple.net.NetController;

public class ControllerEvents
{
    private static ControllerEvents instance;
    private NetController net;
    private Activity context;


    public static ControllerEvents getInstance()
    {
        if (null == instance)
        {
            instance = new ControllerEvents();
        }

        return instance;
    }

    private ControllerEvents()
    {
        this.net = NetController.getInstance();
    }

    public void setContext(Activity context)
    {
        this.context = context;
    }


    public Event[] GetAllEvents()
    {

        return net.GetAllEvents();
    }
    
    public void AttendEvent(DummyContent.DummyItem dummy, Fragment fragment, Activity activity, DummyContent.DummyItem[] dm)
    {
        net.Attend(dummy._id, dummy.maxCap, fragment, activity, dm);
    }
}
