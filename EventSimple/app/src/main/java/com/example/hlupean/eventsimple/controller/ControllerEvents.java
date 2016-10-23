package com.example.hlupean.eventsimple.controller;

import com.example.hlupean.eventsimple.domain.Event;
import com.example.hlupean.eventsimple.repository.RepositoryEvents;

public class ControllerEvents
{
    private RepositoryEvents repo;

    public ControllerEvents()
    {
        this.repo = new RepositoryEvents();
    }

    public String[] getEventsList()
    {
        Event[] eventsList = repo.getEventsList();
        return new String[0];
    }
}
