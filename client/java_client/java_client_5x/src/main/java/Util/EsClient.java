package Util;

import com.unboundid.util.json.JSONObject;
import org.apache.http.HttpResponse;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.logging.ESLoggerFactory;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.elasticsearch.xpack.client.PreBuiltXPackTransportClient;
import sun.security.krb5.Credentials;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Map;


public class EsClient {

    public static String user  = "elastic";
    public static String password  = "changeme";
    private static Client client = null;

    public static String user_password = user + ":" + password;

    public static org.elasticsearch.client.Client GetClient(boolean has_xpack) {

        if (client == null) {
            Settings.Builder builder = Settings.builder();
            builder.put("cluster.name", GetClusterName("localhost"));

            if (has_xpack) {
                builder.put("xpack.security.user", user_password);
            }

            Settings settings = builder.build();

            try {
                TransportAddress transportAddresses = new InetSocketTransportAddress(InetAddress.getByName("localhost"),9300);
                if (has_xpack) {
                    client = new PreBuiltXPackTransportClient(builder.build()).addTransportAddress(transportAddresses);
                } else {
                    client = new PreBuiltTransportClient(builder.build()).addTransportAddress(transportAddresses);
                }
            } catch (UnknownHostException e) {
                e.printStackTrace();
            }
        }
        return client;
    }

    public static String GetClusterName(String es_host) {
        String url = "http://" + es_host + ":9200";
        String json;
        String cluster_name = null;

        HttpResponse response = null;
        try {

            CredentialsProvider provider = new BasicCredentialsProvider();
            UsernamePasswordCredentials credentials = new UsernamePasswordCredentials(user, password);
            provider.setCredentials(AuthScope.ANY, credentials);
            HttpClient client = HttpClientBuilder.create().setDefaultCredentialsProvider(provider).build();

            response = client.execute(new HttpGet(url));
            json = EntityUtils.toString(response.getEntity());
            JSONObject responseOjbect = new JSONObject(json);

            // there must be a better way of doing this. This is too crazy.
            cluster_name = responseOjbect.getFields().get("cluster_name").toString().replace('"',' ').trim();

        } catch (Exception e) {

        }

        return cluster_name;

    }
}
