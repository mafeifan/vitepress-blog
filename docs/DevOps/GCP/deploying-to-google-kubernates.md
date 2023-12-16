```
gcloud services enable \
	containerregistry.googleapis.com \
	container.googleapis.com

gcloud iam service-accounts create github-actions

## 获取email
gcloud iam service-accounts list

## 
gcloud projects add-iam-policy-binding ivory-strategy-313903 \
  --member=serviceAccount:github-actions@ivory-strategy-313903.iam.gserviceaccount.com \
  --role=roles/container.admin \
  --role=roles/storage.admin \
  --role=roles/container.clusterViewer
```



