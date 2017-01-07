package com.example.hlupean.eventsimple.domain;

import java.util.Date;

public class Event
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

    public Event()
    {

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
}
