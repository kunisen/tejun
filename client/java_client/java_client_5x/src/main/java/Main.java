import Util.EsClient;
import org.elasticsearch.action.index.IndexResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.rest.RestStatus;
import static org.elasticsearch.common.xcontent.XContentFactory.*;
import java.util.Date;

public class Main {

    public static void main(String[] args) throws Exception {

        Client client = new EsClient().GetClient(true);
        IndexResponse response = client.prepareIndex("my_test_java_client", "doc", "1")
                .setSource(jsonBuilder()
                        .startObject()
                        .field("title", "kuni")
                        .field("postDate", new Date())
                        .field("message", "trying out Elasticsearch")
                        .endObject()
                )
                .get();

        // Index name
        String _index = response.getIndex();
        // Type name
        String _type = response.getType();
        // Document ID (generated or not)
        String _id = response.getId();
        // Version (if it's the first time you index this document, you will get: 1)
        long _version = response.getVersion();
        // status has stored current instance statement.
        RestStatus status = response.status();

        System.out.println(status);
    }

}
