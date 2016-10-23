package com.example.hlupean.eventsimple;

import android.app.ListActivity;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.ArrayAdapter;

import com.example.hlupean.eventsimple.controller.ControllerEvents;
import com.example.hlupean.eventsimple.domain.Event;

public class MainActivity extends ListActivity
{
    // cacatu asta e un fel de main
    private ControllerEvents ctr;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        this.ctr = new ControllerEvents();

        if (!Login())
        {
            finish();
            System.exit(1);
        }

        ShowList();
    }

    private boolean Login()
    {
        return true;
    }

    private void ShowList()
    {
        String[] lst = ctr.getEventsList();
        ArrayAdapter<String> adapter = new ArrayAdapter<>(getListView().getContext(), android.R.layout.simple_list_item_1, lst);
        getListView().setAdapter(adapter);
    }
}
