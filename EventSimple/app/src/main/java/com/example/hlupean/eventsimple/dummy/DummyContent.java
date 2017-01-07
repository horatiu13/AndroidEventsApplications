package com.example.hlupean.eventsimple.dummy;

import com.example.hlupean.eventsimple.controller.ControllerEvents;
import com.example.hlupean.eventsimple.domain.Event;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Helper class for providing sample content for user interfaces created by
 * Android template wizards.
 * <p>
 * TODO: Replace all uses of this class before publishing your app.
 */
public class DummyContent
{

    /**
     * An array of sample (dummy) items.
     */
    public static final List<DummyItem> ITEMS = new ArrayList<DummyItem>();

    /**
     * A map of sample (dummy) items, by ID.
     */
    public static final Map<String, DummyItem> ITEM_MAP = new HashMap<String, DummyItem>();

    private static int COUNT = 0;

    static
    {
        ControllerEvents ctr = ControllerEvents.getInstance();
        Event[] lstEv = ctr.GetAllEvents();

        if (null != lstEv)
        {
            COUNT = lstEv.length;
            for (int i = 0; i < COUNT; i++)
            {
                addItem(createDummyItem(lstEv[i]));
            }
        }
    }

    private static void addItem(DummyItem item)
    {
        ITEMS.add(item);
        ITEM_MAP.put(item._id, item);
    }

    private static DummyItem createDummyItem(Event ev)
    {
        return new DummyItem(ev);
//        return new DummyItem(ev.getId(), ev.getName(), ev.getCity());
    }
//
//    private static String makeDetails(int position)
//    {
//        StringBuilder builder = new StringBuilder();
//        builder.append("Details about Item: ").append(position);
//        for (int i = 0; i < position; i++)
//        {
//            builder.append("\nMore details information here.");
//        }
//        return builder.toString();
//    }

    /**
     * A dummy item representing a piece of content.
     */
    public static class DummyItem
    {
        public final String id;
        public final String content;
        public final String details;

        public String  _id;
        public String  name;
        public Date    date;
        public int     minAge;
        public String  city;
        public String  address;
        public int     attend;
        public int     maxCap;
        public String  orgName;
        public boolean canEdit;

        public DummyItem(String id, String content, String details)
        {
            this.id = id;
            this.content = content;
            this.details = details;
        }

        public DummyItem(Event ev)
        {
            id = ev.getId();
            content = ev.getCity() + ", " + ev.getAddress();
            details = ev.getCity() + " " + ev.getCanEdit() + " " + ev.getOrgName();

            _id = ev.getId();
            name = ev.getName();
            date = ev.getDate();
            minAge = ev.getMinAge();
            city = ev.getCity();
            address = ev.getAddress();
            attend = ev.getAttend();
            maxCap = ev.getMaxCap();
            orgName = ev.getOrgName();
            canEdit = ev.getCanEdit();
        }

        @Override
        public String toString()
        {
            return name;
        }
    }
}
