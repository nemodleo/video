set-cors:
	gsutil cors set cors.json gs://lecture-videos-us

upload-crypto:
	gsutil -m cp -r hls/* gs://lecture-videos-us/crypto/hls/

upload-stock1:
	gsutil -m cp -r hls/* gs://lecture-videos-us/stock1/hls/

upload-stock2:
	gsutil -m cp -r hls/* gs://lecture-videos-us/stock2/hls/

check-upload-crypto:
	gsutil ls gs://lecture-videos-us/crypto/hls/1058141456/1058141456.m3u8 
