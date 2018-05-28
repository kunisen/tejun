# enable x-pack on elasticsearch

```
unzip elasticsearch-6.2.4.zip
mv elasticsearch-6.2.4 elasticsearch-6.2.4-ssl
cd elasticsearch-6.2.4-ssl
./bin/elasticsearch-plugin install x-pack

vi instance.yml

mkdir cert_prep
bin/x-pack/certutil cert ca --pem --in cert_prep/instance.yml --out cert_prep/certs.zip
cd cert_prep/
unzip certs.zip -d ./certs

cd ..
mkdir config/certs
cp cert_prep/certs/ca/ca.crt cert_prep/certs/node1/* config/certs/

# elasticsearch.yml の編集


./bin/elasticsearch

# パスワード発行
$bin/x-pack/setup-passwords auto -u "https://node1.local:9200"
Initiating the setup of passwords for reserved users elastic,kibana,logstash_system.
The passwords will be randomly generated and printed to the console.
Please confirm that you would like to continue [y/N]y


Changed password for user kibana
PASSWORD kibana = xQU1Kc5hdbF5RaJl4eME

Changed password for user logstash_system
PASSWORD logstash_system = OrO9ERqQYD4nPuAkL8lh

Changed password for user elastic
PASSWORD elastic = BpZkZ6PqLJDj3o27bmcJ

```

# enable x-pack on kibana

```
tar xvzf kibana-6.2.4-darwin-x86_64.tar.gz
mv kibana-6.2.4-darwin-x86_64 kibana-6.2.4-darwin-x86_64-ssl
cd kibana-6.2.4-darwin-x86_64-ssl
./bin/kibana-plugin install x-pack

mkdir config/certs
cp /Users/kuniyasu/Work/installer/elastic/elasticsearch-6.2.4-ssl/cert_prep/certs/ca/ca.crt /Users/kuniyasu/Work/installer/elastic/elasticsearch-6.2.4-ssl/cert_prep/certs/my-kibana/* config/certs


# kibana.yml の編集


./bin/kibana
```
