package com.example.hlupean.eventsimple.net;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import com.example.hlupean.eventsimple.EventListActivity;
import com.example.hlupean.eventsimple.R;
import com.example.hlupean.eventsimple.domain.Event;
import com.example.hlupean.eventsimple.domain.User;
import com.example.hlupean.eventsimple.dummy.DummyContent;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.ExecutionException;

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
    private final String eventUrl   = apiUrl + "/event";
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
        ShowToast(context, message);
    }


    private void ShowToast(final Activity activity, final String message)
    {
        activity.runOnUiThread(new Runnable()
        {
            @Override
            public void run()
            {
                Toast.makeText(activity.getApplicationContext(), message, Toast.LENGTH_SHORT).show();
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

    public Event[] GetAllEvents()
    {
        final String path = eventUrl;

        Log.d(TAG, "Trying get all events on: " + path);
        final Request request = new Request
                .Builder()
                .addHeader("Accept", "application/json")
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer " + token)
                .url(path)
                .build();

        AsyncTask<String, String, Event[]> as = new AsyncTask<String, String, Event[]>()
        {
            @Override
            protected Event[] doInBackground(String... params)
            {
                try
                {
                    Response response = client.newCall(request).execute();

                    if (!response.isSuccessful())
                    {
                        return null;
                    }

                    String r = response.body().string();
                    JSONObject json = new JSONObject("{\"lst\": " + r + "}");
                    JSONArray ar = json.getJSONArray("lst");
                    Event[] events = new Event[ar.length()];

                    for (int i = 0; i < ar.length(); i++)
                    {
                        JSONObject obj = ar.getJSONObject(i);
                        Event e = new Event();

                        e.setId(obj.getString("_id"));
                        e.setName(obj.getString("name"));
//                        e.setDate(new Date(obj.getString("date")));
                        e.setMinAge(obj.getInt("minAge"));
                        e.setCity(obj.getString("city"));
                        e.setAddress(obj.getString("address"));
                        e.setAttend(obj.getInt("attend"));
                        e.setMaxCap(obj.getInt("maxCap"));
                        e.setOrgName(obj.getString("orgName"));

                        try
                        {
                            e.setCanEdit(obj.getBoolean("canEdit"));
                        }
                        catch (JSONException ex)
                        {
                            e.setCanEdit(false);
                        }

                        events[i] = e;
                    }

                    return  events;
                } 
                catch (IOException | JSONException e)
                {
                    return null;
                }
            }
        };

        as.execute();
        try
        {
            Event[] events = as.get();
            return events;
        }
        catch (InterruptedException | ExecutionException e)
        {
            e.printStackTrace();
        }

        return null;
    }
    
    public void Attend(String id, final int maxCap, Fragment fragment, final Activity activity, final DummyContent.DummyItem[] dm)
    {
        final String path = eventUrl + "/attend";

        JSONObject json = new JSONObject();
        try
        {
            json.put("eventId", id);
        }
        catch (JSONException e)
        {
            ShowToast(e.getMessage());
            return;
        }

        Log.d(TAG, "Trying to ATTEND on: " + path);
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
                        ShowToast(activity, e.getMessage());
                    }

                    @Override
                    public void onResponse(Call call, Response resp) throws IOException
                    {
                        Log.d(TAG, "ATTEND request " + path + " returned code: " + resp.code());

                        final String strResp = resp.body().string();
                        try
                        {
                            final JSONObject json = new JSONObject(strResp);
                            if (resp.isSuccessful())
                            {
                                Log.d(TAG, "Attend Success");

                                context.runOnUiThread(new Runnable()
                                {
                                    @Override
                                    public void run()
                                    {
                                        try
                                        {
                                            dm[0].attend = json.getInt("attend");
                                            ((TextView) activity.findViewById(R.id.tvEvAttend)).setText("Attend / Capacity: " + json.getInt("attend") + " / " + maxCap);
                                        }
                                        catch (JSONException ignored)
                                        {

                                        }

                                    }
                                });

                                ShowToast(activity, "Success");
                            }
                            else
                            {
                                String msg = (String) (((JSONArray) json.get("issue")).getJSONObject(0).get("error"));
                                Log.d(TAG, "Attend failed: " + msg);
                                ShowToast(activity, msg);
                            }
                        }
                        catch (JSONException e)
                        {
                            ShowToast(activity, e.getMessage());
                        }
                    }
                });




    }
    
    public User getUser()
    {
        return user;
    }
}
