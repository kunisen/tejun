#------------------------------------------------
# how to import / update visualization via API
#------------------------------------------------
# documentation
#----------------
https://github.com/elastic/kibana/issues/14872
https://github.com/elastic/kibana/pull/11632
https://github.com/elastic/kibana/pull/10858


# get
#-------
## get all visualizations
curl -XGET "http://localhost:5601/api/saved_objects/visualization" | jq .

## get visualization by id
curl "http://localhost:5601/api/saved_objects/visualization/ba47e650-00cd-11e8-9127-c91145cdb200" | jq . > kore1

## response
{
  "id": "ba47e650-00cd-11e8-9127-c91145cdb200",
  "type": "visualization",
  "version": 3,
  "attributes": {
    "title": "aabb_my_hotel",
    "visState": "{\"title\":\"ab_my_hotel\",\"type\":\"pie\",\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"country.keyword:JAPAN\"},\"label\":\"\"},{\"input\":{\"query\":\"country.keyword:INDIA\"}}],\"json\":\"{\\\"other_bucket\\\": true, \\\"other_bucket_key\\\": \\\"other countries\\\"}\"}}]}",
    "uiStateJSON": "{}",
    "description": "",
    "version": 1,
    "kibanaSavedObjectMeta": {
      "searchSourceJSON": "{\"index\":\"ffda2b20-00c7-11e8-9127-c91145cdb200\",\"filter\":[],\"query\":{\"query\":\"\",\"language\":\"lucene\"}}"
    }
  }
}

# update
#--------
## title
curl -H "Content-Type: application/json" -H "kbn-xsrf: true" -i -X PUT -d '
{ "version": 1, "attributes": { "title": "my_hotel_2" } }
' http://localhost:5601/api/saved_objects/visualization/ba47e650-00cd-11e8-9127-c91145cdb200


## visState
curl -H "Content-Type: application/json" -H "kbn-xsrf: true" -i -X PUT -d '
{ "version": 2, "attributes": { "visState": "{\"title\":\"ab_my_hotel\",\"type\":\"pie\",\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"country.keyword:JAPAN\"},\"label\":\"\"},{\"input\":{\"query\":\"country.keyword:INDIA\"}}],\"json\":\"{\\\"other_bucket\\\": true, \\\"other_bucket_key\\\": \\\"other countries\\\"}\"}}]}" } }
' http://localhost:5601/api/saved_objects/visualization/ba47e650-00cd-11e8-9127-c91145cdb200


# create
#-----------
## data source
{
  "id": "ba47e650-00cd-11e8-9127-c91145cdb200",
  "type": "visualization",
  "version": 1,
  "attributes": {
    "title": "ab_my_hotel",
    "visState": "{\"title\":\"ab_my_hotel\",\"type\":\"pie\",\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"country.keyword:JAPAN\"},\"label\":\"\"},{\"input\":{\"query\":\"country.keyword:INDIA\"}}],\"json\":\"{\\\"other_bucket\\\": true, \\\"other_bucket_key\\\": \\\"other countries\\\"}\"}}]}",
    "uiStateJSON": "{}",
    "description": "",
    "version": 1,
    "kibanaSavedObjectMeta": {
      "searchSourceJSON": "{\"index\":\"ffda2b20-00c7-11e8-9127-c91145cdb200\",\"filter\":[],\"query\":{\"query\":\"\",\"language\":\"lucene\"}}"
    }
  }
}

## post visualization with title only
curl -H "Content-Type: application/json" -H "kbn-xsrf: true" -i -X POST -d '
{ "attributes": { "title": "my_hotel_test" } }
' http://localhost:5601/api/saved_objects/visualization/


## post visualization with title and visState and kibanaSavedObjectMeta
curl -H "Content-Type: application/json" -H "kbn-xsrf: true" -i -X POST -d '
{ "attributes": { "title": "my_hotel_test", "visState": "{\"title\":\"ab_my_hotel\",\"type\":\"pie\",\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"country.keyword:JAPAN\"},\"label\":\"\"},{\"input\":{\"query\":\"country.keyword:US\"}}],\"json\":\"{\\\"other_bucket\\\": true, \\\"other_bucket_key\\\": \\\"other countries\\\"}\"}}]}", "kibanaSavedObjectMeta": {"searchSourceJSON": "{\"index\":\"ffda2b20-00c7-11e8-9127-c91145cdb200\",\"filter\":[],\"query\":{\"query\":\"\",\"language\":\"lucene\"}}" } } }
' http://localhost:5601/api/saved_objects/visualization/

## response
HTTP/1.1 200 OK
kbn-name: kibana
kbn-version: 6.0.0
kbn-xpack-sig: 312f3ba9b02d3655820e418a2a3ecb66
content-type: application/json; charset=utf-8
cache-control: no-cache
content-length: 863
Date: Wed, 24 Jan 2018 06:47:00 GMT
Connection: keep-alive

{"id":"60c908c0-00d2-11e8-9127-c91145cdb200","type":"visualization","version":1,"attributes":{"title":"my_hotel_test","visState":"{\"title\":\"ab_my_hotel\",\"type\":\"pie\",\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true},\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"filters\",\"schema\":\"segment\",\"params\":{\"filters\":[{\"input\":{\"query\":\"country.keyword:JAPAN\"},\"label\":\"\"},{\"input\":{\"query\":\"country.keyword:US\"}}],\"json\":\"{\\\"other_bucket\\\": true, \\\"other_bucket_key\\\": \\\"other countries\\\"}\"}}]}","kibanaSavedObjectMeta":{"searchSourceJSON":"{\"index\":\"ffda2b20-00c7-11e8-9127-c91145cdb200\",\"filter\":[],\"query\":{\"query\":\"\",\"language\":\"lucene\"}}"}}}

