# Elastic Stack 6.4 + SSL 有効化の構築手順

## 環境設定 (VM ごとに立ち上げ後に実施)

```
echo "" >> ~/.bash_profile
echo "# path settings" >> ~/.bash_profile
echo "export HISTSIZE=10000" >> ~/.bash_profile
echo "export HISEFILESIZE=10000" >> ~/.bash_profile
echo "" >> ~/.bash_profile
echo "# alias" >> ~/.bash_profile
echo "alias ll='ls -l'" >> ~/.bash_profile
echo "alias ls='ls --color=auto'" >> ~/.bash_profile
echo "alias grep='grep --color=auto'" >> ~/.bash_profile
echo "alias h='history'" >> ~/.bash_profile
echo "" >> ~/.bash_profile
echo "# environment variables" >> ~/.bash_profile
echo "export ES_VERSION=6.4.0" >> ~/.bash_profile
echo "export WORK_DIR=`pwd`" >> ~/.bash_profile
echo "export ES_STACK_DIR=$WORK_DIR/esstack" >> ~/.bash_profile
echo "" >> ~/.bash_profile
echo "export ELATICSEARCH_DIR=$ES_STACK_DIR/elasticsearch" >> ~/.bash_profile
echo "export ES_HOME=/usr/share/elasticsearch" >> ~/.bash_profile
echo "export ES_PATH_CONF=/etc/elasticsearch" >> ~/.bash_profile
echo "" >> ~/.bash_profile
echo "export LINUX64=linux-x86_64" >> ~/.bash_profile
echo "export KIBANA_DIR=$ES_STACK_DIR/kibana" >> ~/.bash_profile
echo "export KIBANA_HOME=/usr/share/kibana" >> ~/.bash_profile

source ~/.bash_profile

```

## インストール (bash コマンド)
## elasticsearch のセットアップと開始 - node 1 台目


```


#------------------------------
# intall essential tools
#------------------------------
# wget
sudo yum install wget -y

# unzip
sudo yum install unzip -y

# openJDK - https://weblabo.oscasierra.net/installing-openjdk9-on-centos7/
wget https://download.java.net/java/GA/jdk10/10.0.2/19aef61b38124481863b1413dce1855f/13/openjdk-10.0.2_linux-x64_bin.tar.gz
tar xvzf openjdk-10.0.2_linux-x64_bin.tar.gz
sudo yum search java-10.0.2-openjdk
sudo mv jdk-10.0.2 /opt/
sudo alternatives --install /usr/bin/java java /opt/jdk-10.0.2/bin/java 1
sudo alternatives --install /usr/bin/jar jar /opt/jdk-10.0.2/bin/jar 1
sudo alternatives --install /usr/bin/javac javac /opt/jdk-10.0.2/bin/javac 1
java --version

#------------------------------
# install elasitcsearch - 全台実行
#------------------------------
cd $ES_STACK_DIR
mkdir -p $ELATICSEARCH_DIR
cd $ELATICSEARCH_DIR
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${ES_VERSION}.rpm
sudo rpm --install -v  elasticsearch-${ES_VERSION}.rpm
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch.service
cd $ES_HOME

#------------------------------
# install kibana - 1 台目のみ実行
#------------------------------
cd $ES_STACK_DIR
mkdir -p $KIBANA_DIR
cd $KIBANA_DIR
wget https://artifacts.elastic.co/downloads/kibana/kibana-${ES_VERSION}-${LINUX64}.tar.gz
tar xvzf kibana-${ES_VERSION}-${LINUX64}.tar.gz
cd $KIBANA_HOME

#------------------------------
# elasticsearch.yml の編集
#------------------------------
sudo sh -c "echo 'node.name: node1' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# trial license を適用 ★
#------------------------------
sudo systemctl start elasticsearch
sleep 60
curl -X POST "localhost:9200/_xpack/license/start_trial?acknowledge=true"
echo
sudo systemctl stop elasticsearch
sleep 60

#------------------------------
# xpack security を有効にする
#------------------------------
sudo sh -c "echo 'xpack.security.enabled: true' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# パスワードの設定
#------------------------------
sudo systemctl start elasticsearch
sleep 60
sudo $ES_HOME/bin/elasticsearch-setup-passwords interactive
# 検証のため、パスワードを changeme に設定

#------------------------------
# CA 証明書の作成
#------------------------------
sudo /usr/share/elasticsearch/bin/elasticsearch-certutil ca

# This tool assists you in the generation of X.509 certificates and certificate
# signing requests for use with SSL/TLS in the Elastic stack.
# Please enter the desired output file [elastic-stack-ca.p12]:     
# Enter password for elastic-stack-ca.p12 : ＜＝ここに CA 用のパスワードを入れる

#------------------------------
# Server 証明書を作成
#------------------------------
sudo /usr/share/elasticsearch/bin/elasticsearch-certutil cert --ca elastic-stack-ca.p12

# This tool assists you in the generation of X.509 certificates and certificate
# signing requests for use with SSL/TLS in the Elastic stack.
# (... 省略 ...)

# Enter password for CA (elastic-stack-ca.p12) :
# Please enter the desired output file [elastic-certificates.p12]:        
# Enter password for elastic-certificates.p12 : ＜＝ここに Server 証明書用のパスワードを入れる

Certificates written to /home/kuniyasu_sen/esstack/elasticsearch/elastic-certificates.p12
# (... 省略 ...)


#------------------------------
# 証明書の配置と権限変更
#------------------------------
sudo mkdir /etc/elasticsearch/certificate
sudo mv elastic-certificates.p12 elastic-stack-ca.p12 /etc/elasticsearch/certificate/
sudo chgrp elasticsearch /etc/elasticsearch/certificate/elastic-certificates.p12
sudo chmod 640 /etc/elasticsearch/certificate/elastic-certificates.p12
sudo chgrp elasticsearch /etc/elasticsearch/certificate/elastic-stack-ca.p12
sudo chmod 640 /etc/elasticsearch/certificate/elastic-stack-ca.p12

#------------------------------
# Keystore の格納
#------------------------------
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password

#------------------------------
# 証明書関連の内容を elasticsearch.yml に追加
#------------------------------
sudo sh -c "echo 'xpack.security.transport.ssl.enabled: true' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.verification_mode: certificate' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.keystore.path: /etc/elasticsearch/certificate/elastic-certificates.p12' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.truststore.path: /etc/elasticsearch/certificate/elastic-certificates.p12' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# elasticsearch node を再起動
#------------------------------
sudo systemctl stop elasticsearch.service
sleep 60
sudo systemctl start elasticsearch.service
sleep 60

#------------------------------
# 接続テスト
#------------------------------
curl http://localhost:9200/_cat/nodes?v -u elastic:changeme -k

#------------------------------
# その他必要な設定
#------------------------------
# 一旦 elasticsearch を停止
sudo systemctl stop elasticsearch.service
sleep 60

# network.host を設定 ★
sudo sh -c "echo 'network.host: _site_' >> $ES_PATH_CONF/elasticsearch.yml"

# discovery 関連の設定
sudo sh -c "echo 'discovery.zen.ping.unicast.hosts: ["10.146.0.3", "10.146.0.4", "10.146.0.2"]' >> $ES_PATH_CONF/elasticsearch.yml"

# elasticsearch node を起動
sudo systemctl start elasticsearch.service
sleep 60

# log より elasticsearch の process が started になることを確認
sudo less /var/log/elasticsearch/elasticsearch.log

#------------------------------
# 接続テスト
#------------------------------
curl http://`hostname`:9200/_cat/nodes?v -u elastic:changeme -k
```

## elasticsearch のセットアップと開始 - node 2 台目以降

**elasticsearch.yml の編集までは同じ手順**


```
#------------------------------
# intall essential tools
#------------------------------
# wget
sudo yum install wget -y

# unzip
sudo yum install unzip -y

# openJDK - https://weblabo.oscasierra.net/installing-openjdk9-on-centos7/
wget https://download.java.net/java/GA/jdk10/10.0.2/19aef61b38124481863b1413dce1855f/13/openjdk-10.0.2_linux-x64_bin.tar.gz
tar xvzf openjdk-10.0.2_linux-x64_bin.tar.gz
sudo yum search java-10.0.2-openjdk
sudo mv jdk-10.0.2 /opt/
sudo alternatives --install /usr/bin/java java /opt/jdk-10.0.2/bin/java 1
sudo alternatives --install /usr/bin/jar jar /opt/jdk-10.0.2/bin/jar 1
sudo alternatives --install /usr/bin/javac javac /opt/jdk-10.0.2/bin/javac 1
java --version

#------------------------------
# install elasitcsearch - 全台実行
#------------------------------
cd $ES_STACK_DIR
mkdir -p $ELATICSEARCH_DIR
cd $ELATICSEARCH_DIR
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${ES_VERSION}.rpm
sudo rpm --install -v  elasticsearch-${ES_VERSION}.rpm
sudo systemctl daemon-reload
sudo systemctl enable elasticsearch.service
cd $ES_HOME

#------------------------------
# elasticsearch.yml の編集
#------------------------------
# node 2 の場合
sudo sh -c "echo 'node.name: node2' >> $ES_PATH_CONF/elasticsearch.yml"

# node 3 の場合
sudo sh -c "echo 'node.name: node3' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# 証明書を既存のサーバーからコピー
#------------------------------
sudo scp -r kuniyasu_sen@10.146.0.3:/etc/elasticsearch/certificate /etc/elasticsearch/

#------------------------------
# trial license を適用 ★
#------------------------------
sudo systemctl start elasticsearch
sleep 60
curl -X POST "localhost:9200/_xpack/license/start_trial?acknowledge=true"
echo
sudo systemctl stop elasticsearch
sleep 60

#------------------------------
# xpack security を有効にする
#------------------------------
sudo sh -c "echo 'xpack.security.enabled: true' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# パスワードの設定
#------------------------------
sudo systemctl start elasticsearch
sleep 60
sudo $ES_HOME/bin/elasticsearch-setup-passwords interactive
# 検証のため、パスワードを changeme に設定

#------------------------------
# 証明書の配置と権限変更
#------------------------------
cd
sudo mkdir /etc/elasticsearch/certificate
sudo cp elastic-certificates.p12 elastic-stack-ca.p12 /etc/elasticsearch/certificate/
sudo chgrp elasticsearch /etc/elasticsearch/certificate/elastic-certificates.p12
sudo chmod 640 /etc/elasticsearch/certificate/elastic-certificates.p12
sudo chgrp elasticsearch /etc/elasticsearch/certificate/elastic-stack-ca.p12
sudo chmod 640 /etc/elasticsearch/certificate/elastic-stack-ca.p12

#------------------------------
# Keystore の格納 (うまく通らない時に、何回か remove -> add したらうまくいく)
#------------------------------
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.keystore.secure_password
sudo /usr/share/elasticsearch/bin/elasticsearch-keystore add xpack.security.transport.ssl.truststore.secure_password

#------------------------------
# 証明書関連の内容を elasticsearch.yml に追加
#------------------------------
sudo sh -c "echo 'xpack.security.transport.ssl.enabled: true' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.verification_mode: certificate' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.keystore.path: /etc/elasticsearch/certificate/elastic-certificates.p12' >> $ES_PATH_CONF/elasticsearch.yml"
sudo sh -c "echo 'xpack.security.transport.ssl.truststore.path: /etc/elasticsearch/certificate/elastic-certificates.p12' >> $ES_PATH_CONF/elasticsearch.yml"

#------------------------------
# elasticsearch node を再起動
#------------------------------
sudo systemctl stop elasticsearch.service
sleep 60
sudo systemctl start elasticsearch.service
sleep 60

#------------------------------
# 接続テスト
#------------------------------
curl http://localhost:9200/_cat/nodes?v -u elastic:changeme -k

#------------------------------
# その他の設定
#------------------------------
sudo systemctl stop elasticsearch.service
sleep 60

# network.host を設定 ★
sudo sh -c "echo 'network.host: _site_' >> $ES_PATH_CONF/elasticsearch.yml"

# discovery 関連の設定
sudo sh -c "echo 'discovery.zen.ping.unicast.hosts: ["10.146.0.3", "10.146.0.4", "10.146.0.2"]' >> $ES_PATH_CONF/elasticsearch.yml"

# elasticsearch node を起動
sudo systemctl start elasticsearch.service

# log より elasticsearch の process が started になることを確認
sudo less /var/log/elasticsearch/elasticsearch.log

#------------------------------
# 接続テスト
#------------------------------
curl http://`hostname`:9200/_cat/nodes?v -u elastic:changeme -k
```
