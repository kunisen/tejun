## Basic steps to enable SSL in elasticsearch 6.1.2 by using certgen


### documents
https://www.elastic.co/blog/tls-elastic-stack-elasticsearch-kibana-logstash-filebeat


### step 1 - download and install elasticsearch and kibana

- https://www.elastic.co/jp/downloads/elasticsearch
- https://www.elastic.co/jp/downloads/kibana


### step 2 - install x-pack plugin

put elasticsearch and kibana into `~/tmp/cert_blog` and install x-pack

```
mkdir -p ~/tmp/cert_blog

cd ~/tmp/cert_blog/elasticsearch-6.1.2-ssl
./bin/elasticsearch-plugin install x-pack

cd ~/tmp/cert_blog/kibana-6.1.2-darwin-x86_64-ssl
./bin/kibana-plugin install x-pack
```


### step 3 - Create CA
#### create CA

```
cd ~/tmp/cert_blog/elasticsearch-6.1.2-ssl

./bin/x-pack/certgen --dn 'CN=MyExample Global CA' --pass --days 3650 --keysize 4096 --out ~/tmp/cert_blog/MyExample_Global_CA.zip
```


```
$cd ~/tmp/cert_blog
$unzip MyExample_Global_CA.zip
Archive:  MyExample_Global_CA.zip
   creating: ca/
  inflating: ca/ca.crt               
  inflating: ca/ca.key         
```



### step 4 - Generate server certificates

```
$echo 'instances:
>   - name: 'node1'
>     dns: [ 'node1.local' ]
>   - name: "node2"
>     dns: [ 'node2.local' ]
>   - name: 'my-kibana'
>     dns: [ 'kibana.local' ]
>   - name: 'logstash'
>     dns: [ 'logstash.local' ]' > certgen_example.yml
```

### create server certificates for each instance
```
$cd ~/tmp/cert_blog/elasticsearch-6.1.2-ssl

bin/x-pack/certgen --days 1095 --cert ~/tmp/cert_blog/ca/ca.crt --key ~/tmp/cert_blog/ca/ca.key --pass --in ~/tmp/cert_blog/certgen_example.yml --out ~/tmp/cert_blog/certs.zip
```

Unzip the created file


```
$cd ~/tmp/cert_blog
$unzip certs.zip -d ./certs
Archive:  certs.zip
   creating: ./certs/node1/
  inflating: ./certs/node1/node1.crt  
  inflating: ./certs/node1/node1.key  
   creating: ./certs/node2/
  inflating: ./certs/node2/node2.crt  
  inflating: ./certs/node2/node2.key  
   creating: ./certs/my-kibana/
  inflating: ./certs/my-kibana/my-kibana.crt  
  inflating: ./certs/my-kibana/my-kibana.key  
   creating: ./certs/logstash/
  inflating: ./certs/logstash/logstash.crt  
  inflating: ./certs/logstash/logstash.key  
```

### modify the 127.0.0.1 line in /etc/hosts to the following line

`127.0.0.1 localhost node1.local node2.local kibana.local logstash.local`


### step 5 - Elasticsearch TLS setup

# create and copy certs to config and config2 folder

```
cd ~/tmp/cert_blog/elasticsearch-6.1.2-ssl

mkdir config/certs

cp -r config config2

cp ~/tmp/cert_blog/ca/ca.crt ~/tmp/cert_blog/certs/node1/* config/certs

cp ~/tmp/cert_blog/ca/ca.crt ~/tmp/cert_blog/certs/node2/* config2/certs
```

# edit config/elasticsearch.yml (add the follow lines to the end of the yml file)
```
node.name: node1
network.host: node1.local
xpack.ssl.key: certs/node1.key
xpack.ssl.certificate: certs/node1.crt
xpack.ssl.certificate_authorities: certs/ca.crt
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
discovery.zen.ping.unicast.hosts: [ 'node1.local', 'node2.local']
node.max_local_storage_nodes: 2
```

# edit config2/elasticsearch.yml (add the follow lines to the end of the yml file)
```
node.name: node2
network.host: node2.local
xpack.ssl.key: certs/node2.key
xpack.ssl.certificate: certs/node2.crt
xpack.ssl.certificate_authorities: certs/ca.crt
xpack.security.transport.ssl.enabled: true
xpack.security.http.ssl.enabled: true
discovery.zen.ping.unicast.hosts: [ 'node1.local', 'node2.local']
node.max_local_storage_nodes: 2
```

# startup the first node
#-------------------------
$ES_PATH_CONF=config ./bin/elasticsearch
(...)
[2018-01-25T15:26:29,434][INFO ][o.e.n.Node               ] [node1] started


# open a new terminal and start the second node
#------------------------------------------------
$ES_PATH_CONF=config2 ./bin/elasticsearch
(...)
[2018-01-25T15:26:52,540][INFO ][o.e.n.Node               ] [node2] started


# set built-in role password
#-----------------------------
$cd /Users/kuniyasu/tmp/cert_blog/elasticsearch-6.1.2-ssl
$bin/x-pack/setup-passwords auto -u "https://node1.local:9200"
Initiating the setup of passwords for reserved users elastic,kibana,logstash_system.
The passwords will be randomly generated and printed to the console.
Please confirm that you would like to continue [y/N]y


Changed password for user kibana
PASSWORD kibana = #naKN?N2XreJa?K_5C8G

Changed password for user logstash_system
PASSWORD logstash_system = t?lmM0euaO4u2QpqdacW

Changed password for user elastic
PASSWORD elastic = cix&7~_Vi6O4PtA%uYf5


# check _cat/nodes on node1 (port : 9200)
#------------------------------------------
$curl --cacert ~/tmp/cert_blog/ca/ca.crt -u elastic 'https://node1.local:9200/_cat/nodes'
Enter host password for user 'elastic':
127.0.0.1 38 99 13 1.77   mdi * node1
127.0.0.1 38 99 10 1.77   mdi - node2


# check _cat/nodes on node2 (port : 9201)
#----------------------------------------
$curl --cacert ~/tmp/cert_blog/ca/ca.crt -u elastic 'https://node2.local:9201/_cat/nodes'
Enter host password for user 'elastic':
127.0.0.1 46 99 58 3.89   mdi - node2
127.0.0.1 36 99 54 3.89   mdi * node1



#-----------------------------------------------------------------
# step 6 - Kibana TLS setup
#-----------------------------------------------------------------
# create config folder and copy certs
#--------------------------------------
$cd /Users/kuniyasu/tmp/cert_blog/kibana-6.1.2-darwin-x86_64-ssl
$mkdir config/certs
$cp ~/tmp/cert_blog/ca/ca.crt ~/tmp/cert_blog/certs/my-kibana/* config/certs
$


# edit config/kibana.yml (add the following lines to kibana.yml)
#----------------------------------------------------------------
server.name: "my-kibana"
server.host: "kibana.local"
server.ssl.enabled: true
server.ssl.certificate: config/certs/my-kibana.crt
server.ssl.key: config/certs/my-kibana.key
elasticsearch.url: "https://node1.local:9200"
elasticsearch.username: "kibana"
elasticsearch.password: "#naKN?N2XreJa?K_5C8G"
elasticsearch.ssl.certificateAuthorities: [ "config/certs/ca.crt" ]


# startup kibana
#------------------
$./bin/kibana
(...)
  log   [06:35:45.427] [info][listening] Server running at https://kibana.local:5601


# open browser and access kibana
#----------------------------------
https://kibana.local:5601/

# also change my elastic user password to "changeme"
# and access again
#----------------------
$cd /Users/kuniyasu/tmp/cert_blog
$curl --cacert ~/tmp/cert_blog/ca/ca.crt -u elastic:changeme 'https://node1.local:9200/_cat/nodes'
Enter host password for user 'elastic':
127.0.0.1 32 99 5 1.46   mdi * node1
127.0.0.1 21 99 4 1.46   mdi - node2
