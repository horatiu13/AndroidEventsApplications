package com.example.hlupean.eventsimple;

import android.app.Activity;
import android.os.Bundle;
import android.support.design.widget.CollapsingToolbarLayout;
import android.support.design.widget.FloatingActionButton;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.TimePicker;

import com.example.hlupean.eventsimple.controller.ControllerEvents;
import com.example.hlupean.eventsimple.domain.User;
import com.example.hlupean.eventsimple.dummy.DummyContent;
import com.example.hlupean.eventsimple.net.NetController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

/**
 * A fragment representing a single Event detail screen.
 * This fragment is either contained in a {@link EventListActivity}
 * in two-pane mode (on tablets) or a {@link EventDetailActivity}
 * on handsets.
 */
public class EventDetailFragment extends Fragment
{
    /**
     * The fragment argument representing the item ID that this fragment
     * represents.
     */
    public static final String ARG_ITEM_ID = "item_id";

    private ControllerEvents ctr = ControllerEvents.getInstance();
    /**
     * The dummy content this fragment is presenting.
     */
    private DummyContent.DummyItem mItem;
    private User user;

    /**
     * Mandatory empty constructor for the fragment manager to instantiate the
     * fragment (e.g. upon screen orientation changes).
     */
    public EventDetailFragment()
    {
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        user = NetController.getInstance().getUser();
        if (getArguments().containsKey(ARG_ITEM_ID))
        {
            // Load the dummy content specified by the fragment
            // arguments. In a real-world scenario, use a Loader
            // to load content from a content provider.
            mItem = DummyContent.ITEM_MAP.get(getArguments().getString(ARG_ITEM_ID));

            final Activity activity = this.getActivity();
            CollapsingToolbarLayout appBarLayout = (CollapsingToolbarLayout) activity.findViewById(R.id.toolbar_layout);
            if (appBarLayout != null)
            {
                if (null != mItem)
                {
                    appBarLayout.setTitle(mItem.name);
                }
                else
                {
                    appBarLayout.setTitle("Add Event");
                }
            }

            // >>>>>>>>>>>>>>>> ADD
            if (null == mItem)
            {
                final EditText etName = (EditText) activity.findViewById(R.id.etName);
                final EditText etCity = (EditText) activity.findViewById(R.id.etCity);
                final EditText etAddress = (EditText) activity.findViewById(R.id.etAddress);
                final DatePicker dpDate = (DatePicker) activity.findViewById(R.id.dpDate);
                final TimePicker tpDate = (TimePicker) activity.findViewById(R.id.tpDate);
                final EditText etMinAge = (EditText) activity.findViewById(R.id.etMinAge);
                final EditText etAttend = (EditText) activity.findViewById(R.id.etAttend);
                TextView tvCap = (TextView) activity.findViewById(R.id.tvEvCapacity);
                final EditText etCap = (EditText) activity.findViewById(R.id.etCapacity);
                final TextView tvOrg = (TextView) activity.findViewById(R.id.tvOrg);
                Button btnAttend = (Button) activity.findViewById(R.id.btnEvAttend);

                ((TextView) activity.findViewById(R.id.tvEvName)).setText("Name");
                ((TextView) activity.findViewById(R.id.tvEvCity)).setText("City");
                ((TextView) activity.findViewById(R.id.tvEvAddress)).setText("Address");
                ((TextView) activity.findViewById(R.id.tvEvDate)).setText("Date");
                ((TextView) activity.findViewById(R.id.tvEvMinAge)).setText("Minimum Age");
                ((TextView) activity.findViewById(R.id.tvEvAttend)).setText("Attend");


                tvCap.setText("Capacity");
                tvCap.setVisibility(View.VISIBLE);
                tvOrg.setText("Organizer: " + user.getUsername());
                btnAttend.setVisibility(View.GONE);

                etName.setVisibility(View.VISIBLE);
                etCity.setVisibility(View.VISIBLE);
                etAddress.setVisibility(View.VISIBLE);
                etMinAge.setVisibility(View.VISIBLE);
                etAttend.setVisibility(View.VISIBLE);
                etCap.setVisibility(View.VISIBLE);

                final Calendar dateToAdd = Calendar.getInstance();
                final String orgNameToAdd = user.getUsername();

                dpDate.setVisibility(View.VISIBLE);
                dpDate.init(
                        Calendar.getInstance().get(Calendar.YEAR), Calendar.getInstance().get(Calendar.MONTH), Calendar.getInstance().get(Calendar.DAY_OF_MONTH),
                        new DatePicker.OnDateChangedListener() {
                            @Override
                            public void onDateChanged(DatePicker view, int year, int monthOfYear, int dayOfMonth)
                            {
                                dateToAdd.set(Calendar.YEAR, year);
                                dateToAdd.set(Calendar.MONTH, monthOfYear);
                                dateToAdd.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                            }
                        });

                tpDate.setVisibility(View.VISIBLE);
                tpDate.setOnTimeChangedListener(new TimePicker.OnTimeChangedListener()
                {
                    @Override
                    public void onTimeChanged(TimePicker view, int hourOfDay, int minute)
                    {
                        dateToAdd.set(Calendar.HOUR_OF_DAY, hourOfDay);
                        dateToAdd.set(Calendar.MINUTE, minute);
                    }
                });


                final EventDetailFragment aux = this;
                FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
                fab.setOnClickListener(new View.OnClickListener()
                {
                    @Override
                    public void onClick(View view)
                    {
                        ctr.SaveEvent(
                                null,
                                etName.getText().toString(),
                                etCity.getText().toString(),
                                etAddress.getText().toString(),
                                dateToAdd.getTime(),
                                etMinAge.getText().toString(),
                                etAttend.getText().toString(),
                                etCap.getText().toString(),
                                orgNameToAdd,
                                activity,
                                aux
                        );
                    }
                });


            }
            // >>>>>>>>>>>>>>>> VIEW
            else if (!mItem.canEdit)
            {
                String dateToPrint;
                DateFormat df = new SimpleDateFormat("dd-MM-yyyy HH:mm", Locale.ENGLISH);
                dateToPrint = df.format(mItem.date);

                ((TextView) activity.findViewById(R.id.tvEvName)).setText("Name: " + mItem.name);
                ((TextView) activity.findViewById(R.id.tvEvCity)).setText("City: " + mItem.city);
                ((TextView) activity.findViewById(R.id.tvEvAddress)).setText("Address: " + mItem.address);
                ((TextView) activity.findViewById(R.id.tvEvDate)).setText("Date: " + dateToPrint);//mItem.date);
                ((TextView) activity.findViewById(R.id.tvEvMinAge)).setText("Minimum Age: " + mItem.minAge);
                ((TextView) activity.findViewById(R.id.tvEvAttend)).setText("Attend / Capacity: " + mItem.attend + " / " + mItem.maxCap);
                ((TextView) activity.findViewById(R.id.tvOrg)).setText("Organizer: " + mItem.orgName);
                activity.findViewById(R.id.fab).setVisibility(View.GONE);

                final Fragment aux = this;
                Button btnAttend = (Button) activity.findViewById(R.id.btnEvAttend);

                btnAttend.setOnClickListener(new View.OnClickListener()
                {
                    @Override
                    public void onClick(View v)
                    {
                        DummyContent.DummyItem[] dm = new DummyContent.DummyItem[1];
                        dm[0] = mItem;
                        ctr.AttendEvent(mItem, aux, activity, dm);
                    }
                });
            }
            // >>>>>>>>>>>>>>>> EDIT
            else
            {
                final EditText etName = (EditText) activity.findViewById(R.id.etName);
                final EditText etCity = (EditText) activity.findViewById(R.id.etCity);
                final EditText etAddress = (EditText) activity.findViewById(R.id.etAddress);
                DatePicker dpDate = (DatePicker) activity.findViewById(R.id.dpDate);
                TimePicker tpDate = (TimePicker) activity.findViewById(R.id.tpDate);
                final EditText etMinAge = (EditText) activity.findViewById(R.id.etMinAge);
                final EditText etAttend = (EditText) activity.findViewById(R.id.etAttend);
                TextView tvCap = (TextView) activity.findViewById(R.id.tvEvCapacity);
                final EditText etCap = (EditText) activity.findViewById(R.id.etCapacity);
                TextView tvOrg = (TextView) activity.findViewById(R.id.tvOrg);
                Button btnAttend = (Button) activity.findViewById(R.id.btnEvAttend);

                ((TextView) activity.findViewById(R.id.tvEvName)).setText("Name");
                ((TextView) activity.findViewById(R.id.tvEvCity)).setText("City");
                ((TextView) activity.findViewById(R.id.tvEvAddress)).setText("Address");
                ((TextView) activity.findViewById(R.id.tvEvDate)).setText("Date");
                ((TextView) activity.findViewById(R.id.tvEvMinAge)).setText("Minimum Age");
                ((TextView) activity.findViewById(R.id.tvEvAttend)).setText("Attend");

                final Calendar dateToAdd = Calendar.getInstance();


                tvCap.setText("Capacity");
                tvCap.setVisibility(View.VISIBLE);
                tvOrg.setText("Organizer: " + mItem.orgName);

                etName.setVisibility(View.VISIBLE);
                etName.setText(mItem.name);

                etCity.setVisibility(View.VISIBLE);
                etCity.setText(mItem.city);

                etAddress.setVisibility(View.VISIBLE);
                etAddress.setText(mItem.address);


                Calendar calMinDate = Calendar.getInstance();
                calMinDate.set(
                        Calendar.getInstance().get(Calendar.YEAR), Calendar.getInstance().get(Calendar.MONTH), Calendar.getInstance().get(Calendar.DAY_OF_MONTH),
                        Calendar.getInstance().get(Calendar.HOUR_OF_DAY), Calendar.getInstance().get(Calendar.MINUTE), Calendar.getInstance().get(Calendar.SECOND)
                );

                dpDate.setMinDate(calMinDate.getTimeInMillis());
                dpDate.init(
                        Calendar.getInstance().get(Calendar.YEAR), Calendar.getInstance().get(Calendar.MONTH), Calendar.getInstance().get(Calendar.DAY_OF_MONTH),
                        new DatePicker.OnDateChangedListener() {
                            @Override
                            public void onDateChanged(DatePicker view, int year, int monthOfYear, int dayOfMonth)
                            {
                                dateToAdd.set(Calendar.YEAR, year);
                                dateToAdd.set(Calendar.MONTH, monthOfYear);
                                dateToAdd.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                            }
                        });
                dpDate.setVisibility(View.VISIBLE);

                tpDate.setVisibility(View.VISIBLE);
                tpDate.setOnTimeChangedListener(new TimePicker.OnTimeChangedListener()
                {
                    @Override
                    public void onTimeChanged(TimePicker view, int hourOfDay, int minute)
                    {
                        dateToAdd.set(Calendar.HOUR_OF_DAY, hourOfDay);
                        dateToAdd.set(Calendar.MINUTE, minute);
                    }
                });
                etMinAge.setVisibility(View.VISIBLE);
                etMinAge.setText(String.valueOf(mItem.minAge));

                etAttend.setVisibility(View.VISIBLE);
                etAttend.setText(String.valueOf(mItem.attend));

                etCap.setVisibility(View.VISIBLE);
                etCap.setText(String.valueOf(mItem.maxCap));

                btnAttend.setText("Delete");
                btnAttend.setBackgroundColor(0xffff0000);
                final String orgNameToAdd = user.getUsername();
                final EventDetailFragment aux = this;

                FloatingActionButton fab = (FloatingActionButton) activity.findViewById(R.id.fab);
                fab.setOnClickListener(new View.OnClickListener()
                {
                    @Override
                    public void onClick(View view)
                    {
                        ctr.SaveEvent(
                                mItem._id,
                                etName.getText().toString(),
                                etCity.getText().toString(),
                                etAddress.getText().toString(),
                                dateToAdd.getTime(),
                                etMinAge.getText().toString(),
                                etAttend.getText().toString(),
                                etCap.getText().toString(),
                                orgNameToAdd,
                                activity,
                                aux
                        );
                    }
                });


                btnAttend.setOnClickListener(new View.OnClickListener()
                {
                    @Override
                    public void onClick(View v)
                    {
                        ctr.DeleteEvent(mItem, activity);
                    }
                });
            }


        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState)
    {
//        Activity activity = this.getActivity();
//        View rootView = inflater.inflate(R.layout.event_detail, container, false);
//
//        // Show the dummy content as text in a TextView.
//        if (mItem != null)
//        {
//            ((TextView) rootView.findViewById(R.id.event_detail)).setText(mItem.city);
//        }
//
//        return rootView;
        return null;
    }
}
