
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexResponse;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.delete.DeleteRequest;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.support.WriteRequest;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.RestClient;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.MatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;

public class Main {

    public static void main(String[] args) throws Exception {

        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost("localhost", 9200, "http"),
                        new HttpHost("localhost", 9201, "http")));


        // bulk request 3 indices
//        BulkRequest request = new BulkRequest();
//        request.add(new IndexRequest("my_test", "doc", "1").source(XContentType.JSON,"title", "foo"));
//        request.add(new IndexRequest("my_test", "doc", "2").source(XContentType.JSON,"title", "bar"));
//        request.add(new IndexRequest("my_test", "doc", "3").source(XContentType.JSON,"title", "baz"));
//        BulkResponse bulkresponse = client.bulk(request);

        // bulk request 30000 indices and will take some time
        BulkRequest bulkrequest = new BulkRequest();
        String index = "my_test";
        String type = "doc";
        String field[] = {"field1", "field2", "field3", "field4"};
        String value = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

        for (int i = 0; i < 30000; i++)
        {
            String id = String.valueOf(i + 1);
            bulkrequest.add(new IndexRequest(index, type, id).source(XContentType.JSON,field[0],value, field[1],value, field[2],value, field[3], value));
        }

        //bulkrequest.setRefreshPolicy(WriteRequest.RefreshPolicy.NONE);
        BulkResponse bulkresponse = client.bulk(bulkrequest);

        //search
        //SearchRequest searchRequest = new SearchRequest();

        SearchRequest searchRequest = new SearchRequest("my_test");
        SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

        // match all
        searchSourceBuilder.query(QueryBuilders.matchAllQuery());

        // match field
        //MatchQueryBuilder matchQueryBuilder = new MatchQueryBuilder("title", "foo");
        //searchSourceBuilder.query(matchQueryBuilder);

        SearchResponse searchResponse = client.search(searchRequest);


        client.close();
        System.out.println("Finished : ");


    }


}

