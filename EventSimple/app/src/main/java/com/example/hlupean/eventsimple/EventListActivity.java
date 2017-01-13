package com.example.hlupean.eventsimple;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.FloatingActionButton;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.example.hlupean.eventsimple.domain.User;
import com.example.hlupean.eventsimple.dummy.DummyContent;
import com.example.hlupean.eventsimple.net.NetController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

/**
 * An activity representing a list of Events. This activity
 * has different presentations for handset and tablet-size devices. On
 * handsets, the activity presents a list of items, which when touched,
 * lead to a {@link EventDetailActivity} representing
 * item details. On tablets, the activity presents the list of items and
 * item details side-by-side using two vertical panes.
 */
public class EventListActivity extends AppCompatActivity
{

    /**
     * Whether or not the activity is in two-pane mode, i.e. running on a tablet
     * device.
     */
    private static final String TAG = EventListActivity.class.getSimpleName();

    private boolean mTwoPane;
    DummyContent dummyContent;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "onCreate");
        LoadActivity();
    }

    public void LoadActivity()
    {
        setContentView(R.layout.activity_event_list);

        dummyContent = new DummyContent();
        User user = NetController.getInstance().getUser();

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        toolbar.setTitle(getTitle());

        FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);

        if (user.isOrg())
        {
            fab.setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    if (mTwoPane)
                    {
                        Bundle arguments = new Bundle();
                        arguments.putString(EventDetailFragment.ARG_ITEM_ID, null);
                        EventDetailFragment fragment = new EventDetailFragment();
                        fragment.setArguments(arguments);
                        getSupportFragmentManager().beginTransaction().replace(R.id.event_detail_container, fragment).commit();
                    }
                    else
                    {
                        Context context = v.getContext();
                        Intent intent = new Intent(context, EventDetailActivity.class);
                        intent.putExtra(EventDetailFragment.ARG_ITEM_ID, (String) null);

                        context.startActivity(intent);
                    }
                }
            });
        }
        else
        {
            fab.setVisibility(View.GONE);
        }


        View recyclerView = findViewById(R.id.event_list);
        assert recyclerView != null;
        setupRecyclerView((RecyclerView) recyclerView);

        if (findViewById(R.id.event_detail_container) != null)
        {
            // The detail container view will be present only in the
            // large-screen layouts (res/values-w900dp).
            // If this view is present, then the
            // activity should be in two-pane mode.
            mTwoPane = true;
        }
    }

    private void setupRecyclerView(@NonNull RecyclerView recyclerView)
    {
        Log.d(TAG, "setupRecyclerView");
        recyclerView.setAdapter(new SimpleItemRecyclerViewAdapter(DummyContent.ITEMS));
    }

    public class SimpleItemRecyclerViewAdapter extends RecyclerView.Adapter<SimpleItemRecyclerViewAdapter.ViewHolder>
    {

        private final List<DummyContent.DummyItem> mValues;

        public SimpleItemRecyclerViewAdapter(List<DummyContent.DummyItem> items)
        {
            mValues = items;
        }

        @Override
        public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
        {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.event_list_content, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(final ViewHolder holder, int position)
        {
            DummyContent.DummyItem dummy = mValues.get(position);
            String txt = dummy.name;
            if (dummy.canEdit)
            {
                holder.mIdView.setTextColor(0xff0000ff); //red: 0xffff0000, blue: 0xff0000ff
//                txt += " (EDIT)";
            }

            DateFormat df = new SimpleDateFormat("dd-MM HH:mm", Locale.ENGLISH);
            String contToPrint = df.format(dummy.date);/* + ", " + dummy.city;*/
            holder.mItem = mValues.get(position);
            holder.mIdView.setText(txt);
            holder.mContentView.setText(contToPrint);

            holder.mView.setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    if (mTwoPane)
                    {
                        Bundle arguments = new Bundle();
                        arguments.putString(EventDetailFragment.ARG_ITEM_ID, holder.mItem.id);
                        EventDetailFragment fragment = new EventDetailFragment();
                        fragment.setArguments(arguments);
                        getSupportFragmentManager().beginTransaction().replace(R.id.event_detail_container, fragment).commit();
                    }
                    else
                    {
                        Context context = v.getContext();
                        Intent intent = new Intent(context, EventDetailActivity.class);
                        intent.putExtra(EventDetailFragment.ARG_ITEM_ID, holder.mItem.id);

                        context.startActivity(intent);
                    }
                }
            });
        }

        @Override
        public int getItemCount()
        {
            return mValues.size();
        }

        public class ViewHolder extends RecyclerView.ViewHolder
        {
            public final View mView;
            public final TextView mIdView;
            public final TextView mContentView;
            public DummyContent.DummyItem mItem;

            public ViewHolder(View view)
            {
                super(view);
                mView = view;
                mIdView = (TextView) view.findViewById(R.id.id);
                mContentView = (TextView) view.findViewById(R.id.content);
            }

            @Override
            public String toString()
            {
                return super.toString() + " '" + mContentView.getText() + "'";
            }
        }
    }
}
