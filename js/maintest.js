$(document).ready(function() {
    $('.header').height($(window).height());
})

$(document).ready(function() {
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });
    // scroll body to 0px on click
    $('#back-to-top').click(function() {
        $('body,html').animate({
            scrollTop: 0
        }, 400);
        return false;
    });
});

var default_defn = {
    icon: "fa-book"
}
var ckan_url = "https://catalogue.data.wa.gov.au"

var theme_defns = {
    "Business Support and Regulation": {
        icon: "fa-book"
    },
    "Cultural Affairs": {
        icon: "fa-paint-brush"
    },
    "Defence": {
        icon: "fa-fighter-jet"
    },
    "Environment": {
        icon: "fa-leaf"
    },
    "Finance Management": {
        icon: "fa-dollar-sign"
    },
    "Immigration": {
        icon: "fa-plane"
    },
    "Maritime Services": {
        icon: "fa-anchor"
    },
    "Security": {
        icon: "fa-shield-alt"
    },
    "Trade": {
        icon: "fa-ship"
    },
    "Civic Infrastructure": {
        icon: "fa-road"
    },
    "Indigenous Affairs": {
        icon: "fa-bullseye"
    },
    "Natural Resources": {
        icon: "fa-gem"
    },
    "Sport and Recreation": {
        icon: "fa-futbol"
    },
    "Transport": {
        icon: "fa-train"
    },
    "Communications": {
        icon: "fas fa-phone-alt"
    },
    "Education and Training": {
        icon: "fa-graduation-cap"
    },
    "Governance": {
        icon: "fa-university"
    },
    "International Relations": {
        icon: "fa-globe"
    },
    "Primary Industries": {
        icon: "fa-industry"
    },
    "Statistical Services": {
        icon: "fa-chart-bar"
    },
    "Community Services": {
        icon: "fa-wheelchair"
    },
    "Employment": {
        icon: "fa-users"
    },
    "Health Care": {
        icon: "fas fa-plus-square"
    },
    "Justice Administration": {
        icon: "fa-balance-scale"
    },
    "Science": {
        icon: "fa-flask"
    },
    "Tourism": {
        icon: "fa-suitcase"
    },
}

function get_package_counts_by_facet(facet_name) {
    return $.ajax({
        url: ckan_url + "/api/3/action/package_search",
        data: {
            "facet.field": '["' + facet_name + '"]',
            rows: 0
        },
        type: "GET",
        dataType: "json",
    })
}

$.when(get_package_counts_by_facet("theme"), get_package_counts_by_facet("geospatial_theme")).done(function(themes, geospatial_themes) {
    // `themes` and `geospatial_themes` are both lists containing three items:
    //    0: The JSON response object
    //    1: The response status text (e.g. "success")
    //    2: The jQuery request object

    var all_theme_counts = []
    if (Array.isArray(themes) === true && themes[0] !== undefined && themes[0]["success"] === true) {
        all_theme_counts = Object.assign(all_theme_counts, themes[0]["result"]["facets"]["theme"])
    }
    /*if (geospatial_themes[0]["success"] == true) {
        all_theme_counts = Object.assign(all_theme_counts, geospatial_themes[0]["result"]["facets"]["geospatial_theme"])
    }*/

    var categoriesContainer = $("div.container.categories_actual > div.row").first()

    Object.keys(all_theme_counts)
        .sort()
        .forEach(function(theme_name) {
            var package_count = all_theme_counts[theme_name]
            var theme_defn = theme_name in theme_defns ? theme_defns[theme_name] : default_defn
            var ckan_search_url = ckan_url + "/dataset?theme=" + theme_name

            var html = $("<p>", {
                    class: "category_item"
                })
                .append($("<i>", {
                    class: "fas fa-fw mr-2 " + theme_defn.icon
                }))
                .append($("<a>", {
                    href: ckan_search_url
                }).text(theme_name))
                .append($("<strong>").text(" (" + package_count + ") "))
            categoriesContainer.append(html)
        })
})

var top_search = new autoComplete({
    selector: '#top_search',
    minChars: 3,
    source: function(term, suggest) {
        term = term.toLowerCase()

        function get_ckan_goodies(goodies_type) {
            return $.ajax({
                url: ckan_url + "/api/3/action/" + goodies_type,
                type: "GET",
                dataType: "json",
            })
        }

        $.when(get_ckan_goodies("tag_list"), get_ckan_goodies("package_list")).done(function(tag_list, package_list) {

            var all_tag_package = []
            if (Array.isArray(tag_list) === true && tag_list[0] !== undefined && tag_list[0]["success"] === true) {
                all_tag_package = Object.assign(all_tag_package, tag_list[0]["result"])
                console.log(all_tag_package)
            }
            

            if (package_list[0]["success"] == true) {
                all_tag_package = Object.assign(all_tag_package, package_list[0]["result"])
                all_tag_package = all_tag_package.map(function(x) {
                    return x.toLowerCase()
                })

                console.log(all_tag_package)

                for (var i = 0; i < all_tag_package.length; i++)
                    all_tag_package[i] = all_tag_package[i].replace(/-/g, ' ').replace(/_/g, ' ')

                var suggestions = [];
                for (i = 0; i < all_tag_package.length; i++)
                    if (~all_tag_package[i].toLowerCase().indexOf(term)) suggestions.push(all_tag_package[i])
                suggestions = suggestions.filter((x, i, a) => a.indexOf(x) == i)
                console.log(suggestions)
                suggest(suggestions);
            }
        })
    }
});

var main_search = new autoComplete({
    selector: '#main_search',
    minChars: 3,
    source: function(term, suggest) {
        term = term.toLowerCase();

        function get_ckan_goodies(goodies_type) {
            return $.ajax({
                url: ckan_url + "/api/3/action/" + goodies_type,
                type: "GET",
                dataType: "json",
            })
        }

        $.when(get_ckan_goodies("tag_list"), get_ckan_goodies("package_list")).done(function(tag_list, package_list) {

            var all_tag_package = []
            if (Array.isArray(tag_list) === true && tag_list[0] !== undefined && tag_list[0]["success"] === true) {
                all_tag_package = Object.assign(all_tag_package, tag_list[0]["result"])
            }

            if (package_list[0]["success"] == true) {
                all_tag_package = Object.assign(all_tag_package, package_list[0]["result"])
                all_tag_package = all_tag_package.map(function(x) {
                    return x.toLowerCase()
                })

                for (var i = 0; i < all_tag_package.length; i++)
                    all_tag_package[i] = all_tag_package[i].replace(/-/g, ' ').replace(/_/g, ' ')

                var suggestions = [];
                for (i = 0; i < all_tag_package.length; i++)
                    if (~all_tag_package[i].toLowerCase().indexOf(term)) suggestions.push(all_tag_package[i])
                suggestions = suggestions.filter((x, i, a) => a.indexOf(x) == i)
                suggest(suggestions);
            }
        })
    }
});


var zen_search = new autoComplete({
    selector: '#zen_search',
    minChars: 3,
    source: function(term, suggest) {
        term = term.toLowerCase();

        function getZenArticles(progress, url = 'https://toolkit.data.wa.gov.au/api/v2/help_center/en-gb/articles.json', articles = []) {
            return new Promise((resolve, reject) => fetch(url)
                            .then(response => {
                                if (response.status !== 200) {
                                    throw `${response.status}: ${response.statusText}`;
                                }
                                response.json().then(data => {
                                    articles = articles.concat(data.articles);

                                    if (data.next_page) {
                                        progress && progress(articles);
                                        getZenArticles(progress, data.next_page, articles).then(resolve).catch(reject)
                                    } else {
                                        resolve(articles);
                                    }
                                }).catch(reject);
                            }).catch(reject));
                    }

                    function progressCallback(articles) {
                        // render progress
                        //console.log(`${articles.length} loaded`);
                    }

                    getZenArticles(progressCallback)
                        .then(articles => {
                            // all articles have been loaded
                            var zendesk_list = []
                            for (var i = 0; i < articles.length; i++) {
                                zendesk_list.push(articles[i].title)
                                for (var j = 0; j < articles[i].label_names.length; j++) {
                                    zendesk_list.push(articles[i].label_names[j])
                                }
                            }
  
                            var choices = zendesk_list.filter(function(elem, index, self) {
                                return index === self.indexOf(elem);
                            });

                            var suggestions = [];
                            for (i = 0; i < choices.length; i++)
                                if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                            suggest(suggestions);
                            //console.log(choices)
                        })
                        .catch(console.error);
                }
            });
    

function searchType() {

    var form = document.top_search_input
    //revert back to q if not zendesk query
    document.getElementById("top_search").setAttribute("name", "q")
    document.top_search_input.search_type.selectedIndex

    //console.log(document.getElementById("top_search"))
    //console.log(form.search_type.selectedIndex)

    switch (form.search_type.selectedIndex) {
        case 0:
            form.action = "https://catalogue.data.wa.gov.au/dataset"
            top_search.destroy();
            var data_search = new autoComplete({
                selector: '#top_search',
                minChars: 3,
                source: function(term, suggest) {
                    term = term.toLowerCase();

                    function get_ckan_goodies(goodies_type) {
                        return $.ajax({
                            url: ckan_url + "/api/3/action/" + goodies_type,
                            type: "GET",
                            dataType: "json",
                        })
                    }

                    $.when(get_ckan_goodies("tag_list"), get_ckan_goodies("package_list")).done(function(tag_list, package_list) {

                        var all_tag_package = []
                        if (Array.isArray(tag_list) === true && tag_list[0] !== undefined && tag_list[0]["success"] === true) {
                            all_tag_package = Object.assign(all_tag_package, tag_list[0]["result"])
                        }

                        if (package_list[0]["success"] == true) {
                            all_tag_package = Object.assign(all_tag_package, package_list[0]["result"])
                            all_tag_package = all_tag_package.map(function(x) {
                                return x.toLowerCase()
                            })

                            for (var i = 0; i < all_tag_package.length; i++)
                                all_tag_package[i] = all_tag_package[i].replace(/-/g, ' ').replace(/_/g, ' ')

                            var suggestions = [];
                            for (i = 0; i < all_tag_package.length; i++)
                                if (~all_tag_package[i].toLowerCase().indexOf(term)) suggestions.push(all_tag_package[i])
                            suggestions = suggestions.filter((x, i, a) => a.indexOf(x) == i)
                            suggest(suggestions);
                        }
                    })
                }
            });
            break;
        case 1:
            form.action = "https://catalogue.data.wa.gov.au/organization"
            top_search.destroy();
            var org_search = new autoComplete({
                selector: '#top_search',
                minChars: 3,
                source: function(term, suggest) {
                    term = term.toLowerCase();
                    $.ajax({
                        url: ckan_url + "/api/3/action/organization_list",
                        type: "get",
                        dataType: "json",
                        complete: function(data) {
                            if (data.responseJSON.success === true) {
                                var choices = [];
                                for (var i = 0; i < data.responseJSON.result.length; i++) {
                                    choices.push(data.responseJSON.result[i])
                                }

                                for (var i = 0; i < choices.length; i++)
                                    choices[i] = choices[i].replace(/-/g, ' ').replace(/_/g, ' ')

                                var suggestions = [];
                                for (i = 0; i < choices.length; i++)
                                    if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                                suggest(suggestions);
                            }
                        }
                    });
                }
            });
            break;
        case 2:
            form.action = "https://catalogue.data.wa.gov.au/group"
            top_search.destroy();
            var group_search = new autoComplete({
                selector: '#top_search',
                minChars: 3,
                source: function(term, suggest) {
                    term = term.toLowerCase();
                    $.ajax({
                        url: ckan_url + "/api/3/action/group_list",
                        type: "get",
                        dataType: "json",
                        complete: function(data) {
                            if (data.responseJSON.success === true) {
                                var choices = [];
                                for (var i = 0; i < data.responseJSON.result.length; i++)
                                    choices.push(data.responseJSON.result[i])

                                for (var i = 0; i < choices.length; i++)
                                    choices[i] = choices[i].replace(/-/g, ' ').replace(/_/g, ' ')
    
                                var suggestions = [];
                                for (i = 0; i < choices.length; i++)
                                    if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                                suggest(suggestions);
                            }
                        }
                    });
                }
            });
            break;
        case 3:
            form.action = "https://catalogue.data.wa.gov.au/showcase"
            top_search.destroy();
            var app_search = new autoComplete({
                selector: '#top_search',
                minChars: 3,
                source: function(term, suggest) {
                    term = term.toLowerCase();
                    $.ajax({
                        url: ckan_url + "/api/3/action/ckanext_showcase_list",
                        type: "get",
                        dataType: "json",
                        complete: function(data) {
                            if (data.responseJSON.success === true) {
                                var showcase_list = []
                                for (var i = 0; i < data.responseJSON.result.length; i++) {
                                    showcase_list.push(data.responseJSON.result[i].title)
                                    for (var j = 0; j < data.responseJSON.result[i].tags.length; j++) {
                                        showcase_list.push(data.responseJSON.result[i].tags[j].name)
                                    }
                                }
                                showcase_list = showcase_list.map(function(x) {
                                    return x.toLowerCase();
                                })

                                var choices = showcase_list.filter(function(elem, index, self) {
                                    return index === self.indexOf(elem);
                                });
                                var suggestions = [];
                                for (i = 0; i < choices.length; i++)
                                    if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                                suggest(suggestions);
                            }
                        }
                    });
                }
            });
            break;
        case 4:
            document.getElementById("top_search").setAttribute("name", "query")
            form.action = "https://toolkit.data.wa.gov.au/hc/en-gb/search?utf8=%E2%9C%93&"
            top_search.destroy();
            var zen_search = new autoComplete({
                selector: '#top_search',
                minChars: 3,
                source: function(term, suggest) {
                    term = term.toLowerCase();

                    function getZenArticles(progress, url = 'https://toolkit.data.wa.gov.au/api/v2/help_center/en-gb/articles.json', articles = []) {
                        return new Promise((resolve, reject) => fetch(url)
                            .then(response => {
                                if (response.status !== 200) {
                                    throw `${response.status}: ${response.statusText}`;
                                }
                                response.json().then(data => {
                                    articles = articles.concat(data.articles);

                                    if (data.next_page) {
                                        progress && progress(articles);
                                        getZenArticles(progress, data.next_page, articles).then(resolve).catch(reject)
                                    } else {
                                        resolve(articles);
                                    }
                                }).catch(reject);
                            }).catch(reject));
                    }

                    function progressCallback(articles) {
                        // render progress
                        //console.log(`${articles.length} loaded`);
                    }

                    getZenArticles(progressCallback)
                        .then(articles => {
                            // all articles have been loaded
                            var zendesk_list = []
                            for (var i = 0; i < articles.length; i++) {
                                zendesk_list.push(articles[i].title)
                                for (var j = 0; j < articles[i].label_names.length; j++) {
                                    zendesk_list.push(articles[i].label_names[j])
                                }
                            }

                            var choices = zendesk_list.filter(function(elem, index, self) {
                                return index === self.indexOf(elem);
                            });

                            var suggestions = [];
                            for (i = 0; i < choices.length; i++)
                                if (~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
                            suggest(suggestions);
                            //console.log(choices)
                        })
                        .catch(console.error);
                }
            });
    }
}

// Body js
var dteNow = new Date();
var intYear = dteNow.getFullYear();

$('#copyright').each(function() {
    var text = $(this).text();
    $(this).text(text.replace('CurrentCopyrightYear', intYear));
});