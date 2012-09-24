/*global jQuery*/

var setupPhotos = (function ($) {   
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) {
                return callback(err);
            }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }
    
    function getImageId(url)
    {
        pattern = /http:\/\/farm[0-9]\.staticflickr\.com\//;
        return url.replace(pattern, '');
    }
    
    function setCookie(name,value,expiryDays) 
    {
        var date = new Date();
        date.setTime(date.getTime()+(expiryDays*24*60*60*1000));
        document.cookie = name+"="+value+"; expires="+date.toGMTString()+"; path=/";
    }

    function getCookie(name) {
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) 
        {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(name+"=") == 0) return c.substring((name+"=").length,c.length);
        }
        return null;
    }
    
    function removeFromCookie(val)
    {
        c = getCookie('flickr-photos-favs');
        arr = c.split('|');
        for (i = 0; i < arr.length; i++)
        {
            if (arr[i] == val)
                arr.splice(i, 1);
        }
        setCookie('flickr-photos-favs', c, 30);
    }
    
    function findInCookie(val)
    {
        c = getCookie('flickr-photos-favs');
        arr = c.split('|');
        for (i = 0; i < arr.length; i++)
        {
            if (arr[i] == val)
                return true;
        }
        return false;
    }
    
    function addToCookie(val)
    {
        c = getCookie('flickr-photos-favs');
        if (c == '')
        {
            c = val;
        }
        else
        {
            c += '|'+val;
        }
        setCookie('flickr-photos-favs', c, 30);
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo';
            elm.appendChild(img);
            
            likeContainer = document.createElement('div');
            
            like = document.createElement('a');
            like.className = 'like';
            
            like.onclick = function()
            {
                src = this.parentNode.previousSibling.src;
                imageId = getImageId(src);
                cname = 'fav_'+imageId;
                
                icon = this.childNodes[0];
                
                if (null == getCookie(cname))
                {
                    setCookie(cname, '1', 30);
                    icon.className = 'icon-heart';
                }
                else
                {
                    setCookie(cname, '', -1);
                    icon.className = 'icon-heart-empty';
                }
                    
                
            }
            
            likeIcon = document.createElement('i');
            
            imageId = getImageId(img.src);
            if (getCookie('fav_'+imageId))
                likeIcon.className = 'icon-heart';
            else
                likeIcon.className = 'icon-heart-empty';
                
            
            like.appendChild(likeIcon);
            likeContainer.appendChild(like);
            
            elm.appendChild(likeContainer);
            
            holder.appendChild(elm);
            
        };
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) {
                return callback(err);
            }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));
