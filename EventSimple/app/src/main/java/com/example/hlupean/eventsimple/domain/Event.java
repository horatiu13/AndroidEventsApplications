package com.example.hlupean.eventsimple.domain;

import java.util.Date;

public class Event
{
    public String   name;
    public Date     date;
    public String   location;
    public String   description;

    Event(String name, Date date, String location, String descrpition)
    {
        this.name           = name;
        this.date           = date;
        this.location       = location;
        this.description    = descrpition;
    }

    @Override
    public String toString() {
        String str = "Name: " + name;
        return  str;
    }
}
