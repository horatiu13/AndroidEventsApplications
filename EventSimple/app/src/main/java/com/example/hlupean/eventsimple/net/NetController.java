package com.example.hlupean.eventsimple.net;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.widget.Toast;

import com.example.hlupean.eventsimple.EventListActivity;
import com.example.hlupean.eventsimple.domain.User;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Date;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class NetController
{

    private static NetController instance = null;

    private static final String TAG = NetController.class.getSimpleName();
    private OkHttpClient client = new OkHttpClient();
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private final String apiUrl     = "http://192.168.56.1:3000/api";
    private final String authUrl    = apiUrl + "/auth";
    private String token            = "";
    private Activity context;
    private User user;

    public  static NetController getInstance()
    {
        if (instance == null)
        {
            instance = new NetController();
        }

        return instance;
    }

    private NetController()
    {

    }

    private void ShowToast(final String message)
    {
        context.runOnUiThread(new Runnable()
        {
            @Override
            public void run()
            {
                Toast.makeText(context.getApplicationContext(), message, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void SetUserTokenAndRedirect(JSONObject json) throws JSONException
    {
        this.token = (String) json.get("token");
        this.user = new User();

        JSONObject jUser = json.getJSONObject("user");
        user.setUsername(jUser.getString("username"));
        user.setPassword(jUser.getString("password"));
        user.setMail(jUser.getString("mail"));
//                                user.setBirthDate(new Date(jUser.getString("birthDate")));
        user.setCity(jUser.getString("city"));
        user.set_id(jUser.getString("_id"));

        try
        {
            user.setOrg(jUser.getInt("isOrg") == 1);
        }
        catch (JSONException e)
        {
            user.setOrg(jUser.getBoolean("isOrg"));
        }

        Intent intent = new Intent(context, EventListActivity.class);
        context.startActivity(intent);
        context.finish();
    }
    public void setContext(Activity context)
    {
        this.context = context;
    }

    public void Login(String username, String password)
    {
        final String path = authUrl + "/session";

        JSONObject json = new JSONObject();
        try
        {
            json.put("username", username);
            json.put("password", password);
        }
        catch (JSONException e)
        {
            ShowToast(e.getMessage());
            return;
        }

        Log.d(TAG, "Trying to login on: " + path);
        RequestBody body = RequestBody.create(JSON, json.toString());
        Request request = new Request
                .Builder()
               .addHeader("Accept", "application/json")
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + token)
                .url(path)
                .post(body)
                .build();

        client.newCall(request)
                .enqueue(new Callback()
                {
                    @Override
                    public void onFailure(Call call, final IOException e)
                    {
                        Log.d(TAG, "Error: " + e.getMessage());
                        ShowToast(e.getMessage());
                    }

                    @Override
                    public void onResponse(Call call, Response resp) throws IOException
                    {
                        Log.d(TAG, "POST request " + path + " returned code: " + resp.code());

                        final String strResp = resp.body().string();
                        try
                        {
                            JSONObject json = new JSONObject(strResp);
                            if (resp.isSuccessful())
                            {
                                Log.d(TAG, "Login Success");

                                SetUserTokenAndRedirect(json);
                            }
                            else
                            {
                                String msg = (String) (((JSONArray) json.get("issue")).getJSONObject(0).get("error"));
                                Log.d(TAG, "Login failed: " + msg);
                                ShowToast(msg);
                            }
                        }
                        catch (JSONException e)
                        {
                            ShowToast(e.getMessage());
                        }
                    }
                });
    }

    public void Register(String username, String password, String mail, String city, Date date, boolean isOrg)
    {
        final String path = authUrl + "/signup";

        JSONObject json = new JSONObject();
        try
        {
            json.put("username", username);
            json.put("password", password);
            json.put("mail", mail);
            json.put("city", city);
            json.put("birthDate", date);
            json.put("isOrg", isOrg);
        }
        catch (JSONException e)
        {
            ShowToast(e.getMessage());
            return;
        }

        Log.d(TAG, "Trying to REGISTER on: " + path);
        RequestBody body = RequestBody.create(JSON, json.toString());
        Request request = new Request
                .Builder()
                .addHeader("Accept", "application/json")
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + token)
                .url(path)
                .post(body)
                .build();

        client.newCall(request)
                .enqueue(new Callback()
                {
                    @Override
                    public void onFailure(Call call, final IOException e)
                    {
                        Log.d(TAG, "Error: " + e.getMessage());
                        ShowToast(e.getMessage());
                    }

                    @Override
                    public void onResponse(Call call, Response resp) throws IOException
                    {
                        Log.d(TAG, "REGISTER request " + path + " returned code: " + resp.code());

                        final String strResp = resp.body().string();
                        try
                        {
                            JSONObject json = new JSONObject(strResp);
                            if (resp.isSuccessful())
                            {
                                Log.d(TAG, "Register Success");
                                SetUserTokenAndRedirect(json);
                            }
                            else
                            {
                                String msg = (String) (((JSONArray) json.get("issue")).getJSONObject(0).get("error"));
                                Log.d(TAG, "Register failed: " + msg);
                                ShowToast(msg);
                            }
                        }
                        catch (JSONException e)
                        {
                            ShowToast(e.getMessage());
                        }
                    }
                });

    }

}
