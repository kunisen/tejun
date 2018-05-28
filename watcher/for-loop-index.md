## A simple example of how to use watcher result to indexing to a new index separately

### prepare data

```
DELETE my_test
PUT my_test/doc/1
{"number": 1}

PUT my_test/doc/2
{"number": 2}

PUT my_test/doc/3
{"number": 3}
```

### check data
```
GET my_test/_search

# result - we have data fed successfully.
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 1,
    "hits": [
      {
        "_index": "my_test",
        "_type": "doc",
        "_id": "2",
        "_score": 1,
        "_source": {
          "number": 2
        }
      },
      {
        "_index": "my_test",
        "_type": "doc",
        "_id": "1",
        "_score": 1,
        "_source": {
          "number": 1
        }
      },
      {
        "_index": "my_test",
        "_type": "doc",
        "_id": "3",
        "_score": 1,
        "_source": {
          "number": 3
        }
      }
    ]
  }
}
```

### prepare & execute watcher

**condition** : if hits total >= 0

**transform** : n/a

**action**    :
1. output some messages to console
2. indexing data to another new index per document

```
DELETE _xpack/watcher/watch/my_test_watcher
PUT _xpack/watcher/watch/my_test_watcher
{
  "trigger": {
    "schedule": {
      "interval": "30s"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [
          "my_test"
        ],
        "body": {
          "query": {
            "match_all": {}
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.hits.total": {
        "gte": 0
      }
    }
  },
  "actions": {
    "logging_test": {
      "logging": {
        "text": "watcher is running"
      }
    },
    "index_test": {
      "transform": {
          "script": """
          for (int i = 0; i < ctx.payload.hits.hits.length; ++i) {
            // copy the source field to new index
            ctx.payload.hits.hits[i] = ctx.payload.hits.hits[i]._source;

            // add a new field to new index
            ctx.payload.hits.hits[i].test_field = i;
          }  
          return [ '_doc' : ctx.payload.hits.hits]
          """
        },
      "index": {
        "index": "my_test2",
        "doc_type": "doc"
      }
    }
  }
}

# or run watcher manually if a long interval needs to be specified
POST _xpack/watcher/watch/my_test_watcher/_execute

# result from console
# [2018-01-24T17:26:38,502][INFO ][o.e.x.w.a.l.ExecutableLoggingAction] [buvHyIV] watcher is running
```

### check the new index
**We will find my_test2 index are created successfully.**

```
DELETE my_test2
GET my_test2/_search

# result
{
  "took": 0,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": 3,
    "max_score": 1,
    "hits": [
      {
        "_index": "my_test2",
        "_type": "doc",
        "_id": "RWVHJ2EBWufEwockdK-J",
        "_score": 1,
        "_source": {
          "number": 2,
          "test_field": 0
        }
      },
      {
        "_index": "my_test2",
        "_type": "doc",
        "_id": "RmVHJ2EBWufEwockdK-J",
        "_score": 1,
        "_source": {
          "number": 1,
          "test_field": 1
        }
      },
      {
        "_index": "my_test2",
        "_type": "doc",
        "_id": "R2VHJ2EBWufEwockdK-J",
        "_score": 1,
        "_source": {
          "number": 3,
          "test_field": 2
        }
      }
    ]
  }
}
```
