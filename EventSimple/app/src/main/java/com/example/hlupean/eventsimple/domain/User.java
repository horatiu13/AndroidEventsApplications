package com.example.hlupean.eventsimple.domain;

import java.util.Date;

/**
 * Created by hlupean on 05-Jan-17.
 */

public class User
{
    private String username;
    private String password;
    private String mail;
    private Date birthDate;
    private String city;
    private boolean isOrg;
    private String _id;

    public User()
    {

    }

    public User(String username, String password, String mail, Date birthDate, String city, boolean isOrg, String _id)
    {
        this.username = username;
        this.password = password;
        this.mail = mail;
        this.birthDate = birthDate;
        this.city = city;
        this.isOrg = isOrg;
        this._id = _id;
    }


    public String getUsername()
    {
        return username;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }

    public String getPassword()
    {
        return password;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }

    public String getMail()
    {
        return mail;
    }

    public void setMail(String mail)
    {
        this.mail = mail;
    }

    public Date getBirthDate()
    {
        return birthDate;
    }

    public void setBirthDate(Date birthDate)
    {
        this.birthDate = birthDate;
    }

    public String getCity()
    {
        return city;
    }

    public void setCity(String city)
    {
        this.city = city;
    }

    public boolean isOrg()
    {
        return isOrg;
    }

    public void setOrg(boolean org)
    {
        isOrg = org;
    }

    public String get_id()
    {
        return _id;
    }

    public void set_id(String _id)
    {
        this._id = _id;
    }
}
