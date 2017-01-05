package com.example.hlupean.eventsimple;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.DatePicker;
import android.widget.EditText;
import android.widget.TextView;

import com.example.hlupean.eventsimple.controller.ControllerAuth;
import com.example.hlupean.eventsimple.net.NetController;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class RegisterActivity extends AppCompatActivity
{
    static final String TAG = RegisterActivity.class.getSimpleName();
    ControllerAuth ctrlUser;

    Button btnRegister;
    EditText tbxUser;
    EditText tbxPass;
    EditText tbxMail;
    EditText tbxCity;
    DatePicker datePicker;
    CheckBox cbxOrg;


    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        Log.d(TAG, "onCreate");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        ctrlUser = ControllerAuth.getInstance();
        ctrlUser.setContext(this);
        NetController.getInstance().setContext(this);

        btnRegister = (Button) findViewById(R.id.btnRegister);
        tbxUser     = (EditText) findViewById(R.id.tbxUsername);
        tbxPass     = (EditText) findViewById(R.id.tbxPassword);
        tbxMail     = (EditText) findViewById(R.id.tbxEmail);
        tbxCity     = (EditText) findViewById(R.id.tbxCity);
        datePicker  = (DatePicker) findViewById(R.id.datePicker);
        cbxOrg      = (CheckBox) findViewById(R.id.cbxOrg);

        final TextView tvDate = (TextView) findViewById(R.id.tvBirthDate);

        tvDate.setText("Date: " + SimpleDateFormat.getDateInstance().format(Calendar.getInstance().getTime()));
        datePicker.init(
                Calendar.getInstance().get(Calendar.YEAR), Calendar.getInstance().get(Calendar.MONTH), Calendar.getInstance().get(Calendar.DAY_OF_MONTH),
                new DatePicker.OnDateChangedListener() {
            @Override
            public void onDateChanged(DatePicker view, int year, int monthOfYear, int dayOfMonth)
            {
                Calendar c = Calendar.getInstance();
                c.set(year, monthOfYear, dayOfMonth);
                tvDate.setText("Date: " + SimpleDateFormat.getDateInstance().format(c.getTime()));

            }
        });

        Calendar cal = Calendar.getInstance();
        cal.set(1900, 0, 1, 0, 0, 0);
        datePicker.setMinDate(cal.getTimeInMillis());
        datePicker.setMaxDate(System.currentTimeMillis());



        btnRegister.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                String username = tbxUser.getText().toString();
                String password = tbxPass.getText().toString();
                String mail = tbxMail.getText().toString();
                String city = tbxCity.getText().toString();
                Calendar cal = Calendar.getInstance();
                cal.set(datePicker.getYear(), datePicker.getMonth(), datePicker.getDayOfMonth(), 0, 0, 0);
                Date date = cal.getTime();
                boolean isOrg = cbxOrg.isActivated();
                Log.d(TAG, "Will register user " + username);
                ctrlUser.Register(username, password, mail, city, date, isOrg);
            }
        });

    }
}
