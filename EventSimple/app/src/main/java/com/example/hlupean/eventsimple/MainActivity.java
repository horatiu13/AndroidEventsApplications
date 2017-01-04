package com.example.hlupean.eventsimple;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;

import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.example.hlupean.eventsimple.controller.ControllerAuth;
import com.example.hlupean.eventsimple.net.NetController;


public class MainActivity extends Activity
{
    NetController net = new NetController();
    ControllerAuth ctrlUser = new ControllerAuth(net);

    Button btnLogin;
    Button btnRegister;
    EditText tbxUser;
    EditText tbxPass;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnLogin = (Button) findViewById(R.id.btnLogin);
        btnRegister = (Button) findViewById(R.id.btnRegister);
        tbxUser = (EditText) findViewById(R.id.tbxUser);
        tbxPass = (EditText) findViewById(R.id.tbxPass);

        btnLogin.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                String username = tbxUser.getText().toString();
                String password = tbxPass.getText().toString();
                String err = ctrlUser.Login(username, password);

                if (null != err)
                {
                    Toast.makeText(getApplicationContext(), err, Toast.LENGTH_SHORT).show();
                }
                else
                {
                    Toast.makeText(getApplicationContext(), "Redirecting...", Toast.LENGTH_SHORT).show();
                }

            }
        });
    }
}