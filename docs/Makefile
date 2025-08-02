set-cors:
	gsutil cors set cors.json gs://lecture-videos-us

upload-crypto:
	gsutil -m cp -r ./crypto/hls/* gs://lecture-videos-us/crypto/hls/

check-upload-crypto:
	gsutil ls gs://lecture-videos-us/crypto/hls/1058141456/1058141456.m3u8 
