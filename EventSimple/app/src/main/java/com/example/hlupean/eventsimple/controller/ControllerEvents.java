package com.example.hlupean.eventsimple.controller;

import android.app.Activity;
import android.support.v4.app.Fragment;
import android.widget.Toast;

import com.example.hlupean.eventsimple.EventDetailFragment;
import com.example.hlupean.eventsimple.domain.Event;
import com.example.hlupean.eventsimple.dummy.DummyContent;
import com.example.hlupean.eventsimple.net.NetController;

import java.util.Date;

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

    public void SaveEvent(String id, String name, String city, String address, Date d, String minAge, String attend, String maxCap, String org, Activity activity, EventDetailFragment frag)
    {
        try
        {
            int dwMinAge = Integer.parseInt(minAge);
            int dwAttend = Integer.parseInt(attend);
            int dwMaxCap = Integer.parseInt(maxCap);

            Event ev = new Event(id, name, city, address, d, dwMinAge, dwAttend, dwMaxCap, org);

            this.net.SaveEvent(ev, activity, frag);
        }
        catch (NumberFormatException ex)
        {
            Toast.makeText(activity.getApplicationContext(), "At least one field is invalid. Check again.", Toast.LENGTH_SHORT).show();
        }
    }

    public void DeleteEvent(DummyContent.DummyItem mItem, Activity activity)
    {
        this.net.DeleteEvent(mItem._id, activity);
    }
}
