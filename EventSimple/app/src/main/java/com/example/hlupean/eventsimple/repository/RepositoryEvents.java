package com.example.hlupean.eventsimple.repository;

import com.example.hlupean.eventsimple.domain.Event;

public class RepositoryEvents
{
    private Event[] listFakeEvents;

    public RepositoryEvents()
    {
        InitFakeList();
    }

    public Event[] getEventsList()
    {
        return new Event[0];
    }


    private void InitFakeList()
    {
        listFakeEvents = new Event[2];
//        listFakeEvents[0] = new Event();
    }
}
