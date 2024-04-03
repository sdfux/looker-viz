LIB = dscc.min.js d3.v4.min.js
DEST = gs://codelab-looker/influencer

cluster-r.js: cluster-r-src.js
	cat $(LIB) > $@
	echo >> $@
	cat $^ >> $@

deploy: cluster-r.css cluster-r.js cluster-r.json manifest.json
	gsutil cp -a public-read $^ $(DEST)

.PHONY:deploy
