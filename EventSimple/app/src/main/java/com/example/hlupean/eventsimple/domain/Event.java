package com.example.hlupean.eventsimple.domain;

import android.support.annotation.NonNull;

import java.util.Date;

public class Event implements Comparable<Event>
{
    private String  _id;
    private String  name;
    private Date    date;
    private int     minAge;
    private String  city;
    private String  address;
    private int     attend;
    private int     maxCap;
    private String  orgName;
    private boolean canEdit;

    public static User currentUser = null;

    public Event()
    {

    }
    
    public Event(String id, String name, String city, String address, Date d, int minAge, int attend, int maxCap, String org)
    {
        this._id = id;
        this.name = name;
        this.date = d;
        this.city = city;
        this.address = address;
        this.minAge = minAge;
        this.attend = attend;
        this.maxCap = maxCap;
        this.orgName = org;
    }
    
    @Override
    public String toString() {
        String str = "Name: " + name;
        return  str;
    }

    public String getCity()
    {
        return city;
    }

    public String getName()
    {
        return name;
    }

    public String getId()
    {
        return _id;
    }

    public void setId(String _id)
    {
        this._id = _id;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public Date getDate()
    {
        return date;
    }

    public void setDate(Date date)
    {
        this.date = date;
    }

    public int getMinAge()
    {
        return minAge;
    }

    public void setMinAge(int minAge)
    {
        this.minAge = minAge;
    }

    public void setCity(String city)
    {
        this.city = city;
    }

    public String getAddress()
    {
        return address;
    }

    public void setAddress(String address)
    {
        this.address = address;
    }

    public int getAttend()
    {
        return attend;
    }

    public void setAttend(int attend)
    {
        this.attend = attend;
    }

    public int getMaxCap()
    {
        return maxCap;
    }

    public void setMaxCap(int maxCap)
    {
        this.maxCap = maxCap;
    }

    public String getOrgName()
    {
        return orgName;
    }

    public void setOrgName(String orgName)
    {
        this.orgName = orgName;
    }

    public boolean getCanEdit()
    {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit)
    {
        this.canEdit = canEdit;
    }

    @Override
    public int compareTo(@NonNull Event o)
    {

        if (o.canEdit == canEdit) return date.compareTo(o.date);
        if (canEdit) return  -1;
        return 1;
    }
}
