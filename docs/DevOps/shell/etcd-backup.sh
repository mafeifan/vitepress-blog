#!/bin/bash

ETCDCTL_PATH='/usr/local/bin/etcdctl'
ENDPOINTS='https://10.0.2.4:2379'
ETCD_DATA_DIR="/var/lib/etcd"
BACKUP_DIR="/var/backups/kube_etcd/etcd-$(date +%Y-%m-%d-%H-%M-%S)"
KEEPBACKUPNUMBER='5'
ETCDBACKUPPERIOD='30'
ETCDBACKUPSCIPT='/usr/local/bin/kube-scripts'
ETCDBACKUPHOUR=''

ETCDCTL_CERT="/etc/ssl/etcd/ssl/admin-master.pem"
ETCDCTL_KEY="/etc/ssl/etcd/ssl/admin-master-key.pem"
ETCDCTL_CA_FILE="/etc/ssl/etcd/ssl/ca.pem"

[ ! -d $BACKUP_DIR ] && mkdir -p $BACKUP_DIR

export ETCDCTL_API=2;$ETCDCTL_PATH backup --data-dir $ETCD_DATA_DIR --backup-dir $BACKUP_DIR

sleep 3

{
export ETCDCTL_API=3;$ETCDCTL_PATH --endpoints="$ENDPOINTS" snapshot save $BACKUP_DIR/snapshot.db \
                                   --cacert="$ETCDCTL_CA_FILE" \
                                   --cert="$ETCDCTL_CERT" \
                                   --key="$ETCDCTL_KEY"
} > /dev/null

sleep 3

cd $BACKUP_DIR/../;ls -lt |awk '{if(NR > '$KEEPBACKUPNUMBER'){print "rm -rf "$9}}'|sh

if [[ ! $ETCDBACKUPHOUR ]]; then
  time="*/$ETCDBACKUPPERIOD * * * *"
else
  if [[ 0 == $ETCDBACKUPPERIOD ]];then
    time="* */$ETCDBACKUPHOUR * * *"
  else
    time="*/$ETCDBACKUPPERIOD */$ETCDBACKUPHOUR * * *"
  fi
fi

crontab -l | grep -v '#' > /tmp/file
echo "$time sh $ETCDBACKUPSCIPT/etcd-backup.sh" >> /tmp/file && awk ' !x[$0]++{print > "/tmp/file"}' /tmp/file
crontab /tmp/file
rm -rf /tmp/file