package com.example.hlupean.eventsimple;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;

import com.example.hlupean.eventsimple.controller.ControllerAuth;
import com.example.hlupean.eventsimple.net.NetController;

public class MainActivity extends Activity
{
    static final String TAG = MainActivity.class.getSimpleName();

    ControllerAuth ctrlUser;

    Button btnLogin;
    Button btnRegister;
    EditText tbxUser;
    EditText tbxPass;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        Log.d(TAG, "onCreate");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ctrlUser = ControllerAuth.getInstance();
        ctrlUser.setContext(this);
        NetController.getInstance().setContext(this);

        final ProgressBar pbLogin = (ProgressBar) findViewById(R.id.pbLogin);
        pbLogin.setVisibility(View.GONE);

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
//                pbLogin.setVisibility(View.VISIBLE);
                ctrlUser.Login(username, password, pbLogin);
//                findViewById(R.id.pbLogin).setVisibility(View.VISIBLE);
            }
        });

        final Activity act = this;

        btnRegister.setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                Intent intent = new Intent(act, RegisterActivity.class);
                startActivity(intent);
            }
        });
    }
}