### 1. Create watcher in Kibana - Management - Watcher - Create new watch - Advanced Watch
Examples: 
ID : my_test_watcher_1
Name : monitoring_free_disk_space


### 2. Copy `watcher.json` body into `Watch JSON ( Syntax ) section
https://github.com/elastic/examples/tree/master/Alerting/Sample%20Watches/monitoring_free_disk_space

Here is the body of watcher.json
```
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "metadata": {
    "lower_bound": 0.5
  },
  "input": {
    "search": {
      "request": {
        "indices": ".monitoring-es-test",
        "types": "doc",
        "body": {
          "query": {
            "bool": {
              "filter": [
                {
                  "range": {
                    "timestamp": {
                      "gte": "{{ctx.trigger.scheduled_time}}||-5m"
                    }
                  }
                },
                {
                  "term": {
                    "type" : "node_stats"
                  }
                }
              ]
            }
          },
          "aggs": {
            "nodes": {
              "terms": {
                "field": "source_node.name",
                "size": 100
              },
              "aggs": {
                "total_in_bytes": {
                  "max": {
                    "field": "node_stats.fs.total.total_in_bytes"
                  }
                },
                "available_in_bytes": {
                  "max": {
                    "field": "node_stats.fs.total.available_in_bytes"
                  }
                },
                "free_ratio": {
                  "bucket_script": {
                    "buckets_path": {
                      "available_in_bytes": "available_in_bytes",
                      "total_in_bytes": "total_in_bytes"
                    },
                    "script": "params.available_in_bytes / params.total_in_bytes"
                  }
                }
              }
            }
          },
          "size": 0
        }
      }
    }
  },
  "throttle_period": "30m",
  "condition": {
    "script": {
      "id": "condition"
    }
  },
  "transform": {
    "script": {
      "id": "transform"
    }
  },
  "actions": {
    "log": {
      "logging": {
        "text": "Available space on Filesystem is below recommended ratio of {{ctx.metadata.lower_bound}} for following nodes: {{#ctx.payload._value}}For node {{node_name}}: {{available_in_gb}}gb of {{total_in_gb}}gb is available:{{/ctx.payload._value}}"
      }
    }
  }
}
```
