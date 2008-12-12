function current_tab()
{
	return browser.get_nth_page(browser.page);
}

function go_back()
{
	current_tab().webView.go_back();
	return false;
}

function go_forward()
{
	current_tab().webView.go_forward();
	return false;
}

function refresh_page()
{
	current_tab().webView.reload();
	return false;
}

function close_tab(button, tab)
{
	browser.remove_page(browser.page_num(tab));
	//for some reason this complains tab is not an object
	//tab.destroy();

	if(!browser.get_n_pages())
	{
		browser.newTab().navigateTo(homePage);
	}
	
	return false;
}

function browse(urlBar, tab)
{
	if (urlBar.text.search("://") < 0)
	{
		urlBar.text = "http://" + urlBar.text;
	}
	
	tab.webView.open(urlBar.text);
	
	return false;
}

function show_find()
{
	findBox.show();
	findBox.entryBox.grab_focus();

	return false;
}

function find(entry, event, box)
{
	//current_tab().webView.unmark_text_matches();
	current_tab().webView.search_text("", box.caseSensitive.active, 
									  true, true);
	current_tab().webView.search_text(entry.text, box.caseSensitive.active, 
									  true, true);

	return false;
}

function show_about()
{
	// reuse window, formatting, centering, etc
	about_window = new Gtk.Window();
	var title_label = new Gtk.Label({label:"<span size='x-large'>" +
									 "<b>Seed Browser 0.2</b></span>", 
									 use_markup: true});
	var under_label = new Gtk.Label({label:"A simple WebKit-based browser, " +
									 "in Seed."});
	var by_label = new Gtk.Label({label:"(C) 2008, seed maintainers"});

	var close_button = Gtk.Button.new_from_stock(Gtk.STOCK_CLOSE);
	// TODO: actually destroy the window!
	close_button.signal.clicked.connect(function(){about_window.hide()});

	var vbox = new Gtk.VBox();
	vbox.pack_start(title_label, true, true, 5);
	vbox.pack_start(under_label, true, true, 5);
	vbox.pack_start(by_label, true, true, 5);
	vbox.pack_start(close_button, false, false, 5);
	
	about_window.add(vbox);
	// instead of this, use packing once I find out how to do margins!
	about_window.resize(300, 200);
	about_window.show_all();
	return false;
}

function get_up_url()
{
	var curr_url = current_tab().webView.get_main_frame().get_uri();
	var last = curr_url.lastIndexOf("/"); 

	if ( curr_url.length-1 == last )
		return curr_url.substring(0,curr_url.lastIndexOf("/"));
	else 
		return curr_url.substring(0,last);
}

function create_action(nam, label, stock_id, accelerator, func)
{
	var new_action;
	
	if(label != null)
		new_action = new Gtk.Action({name:nam, label:label,
									 stock_id:stock_id});
	else
		new_action = new Gtk.Action({name:nam, 
									 stock_id:stock_id});
		
	new_action.set_accel_group(accels);
	
	actions.add_action_with_accel(new_action, accelerator);
		
	new_action.connect_accelerator();
	new_action.signal.activate.connect(func);
	
	return new_action;
}

function initialize_actions()
{
	actions = new Gtk.ActionGroup({name:"toolbar"});

	accels = new Gtk.AccelGroup();
	
	new_tab_action = 
		create_action("new", "New Tab", "gtk-new", "<Control>t", 
					  function ()
					  {
						  browser.newTab().setWebView(new WebKit.WebView());
						  browser.page = browser.get_n_pages() - 1;
					  });
	
	close_tab_action = 
		create_action("close", 
					  "Close Tab", 
					  "gtk-close", 
					  "<Control>w", 
					  close_tab);

	go_back_action = 
		create_action("go-back", 
					  "Go Back", 
					  "gtk-go-back", 
					  "<Alt>Left", 
					 go_back);

	go_forward_action = 
		create_action("go-forward", 
					  "Go Forward", 
					  "gtk-go-forward", 
					  "<Alt>Right", 
					 go_forward);
	
	focus_urlbar_action = 
		create_action("url", 
					  "Focus URL Bar", 
					  "", 
					  "<Control>l", 
					  function ()
					  {
						  current_tab().toolbar.urlBar.grab_focus();
					  });
	refresh_action = 
		create_action("refresh", 
					  "Refresh", 
					  "gtk-reload", 
					  "F5", 
					 refresh_page);
	
	quit_action = 
		create_action("quit",
					  null,
					  "gtk-quit", 
					  null, 
					  shutdown);
	
	cut_action = 
		create_action("cut",
					  null,
					  "gtk-cut",
					  null,
					  function ()
					  {
						  current_tab().webView.cut_clipboard();
					  });
	
	copy_action = 
		create_action("copy",
					  null,
					  "gtk-copy",
					  null,
					  function ()
					  {
						  current_tab().webView.copy_clipboard();
					  });
	
	paste_action =
		create_action("paste", 
					  null, 
					  "gtk-paste", 
					  null,
					  function ()
					  {
						  current_tab().webView.paste_clipboard();
					  });
	
	print_action = 
		create_action("print", 
					  null, 
					  "gtk-print", 
					  "<Control>p",
					  function ()
					  {
						  current_tab().webView.execute_script("print()");
					  });
	
	zoom_in_action = 
		create_action("zoom-in", 
					  null, 
					  "gtk-zoom-in", 
					  "<Control>plus", // TODO: needs to work for Ctrl-= also!!
					  function ()
					  {
						var new_zoom_level = current_tab().webView.zoom_level + 0.1;
						// FIXME: for some reason segfaults if try to zoom beyond here
						if (new_zoom_level < 5.65)
						  current_tab().webView.zoom_level = new_zoom_level;
						  return false;
					  });

	zoom_out_action = 
		create_action("zoom-out", 
					  null, 
					  "gtk-zoom-out", 
					  "<Control>minus",
					  function ()
					  {
						var new_zoom_level = current_tab().webView.zoom_level - 0.1;
						if ( new_zoom_level > 0 )
						  current_tab().webView.zoom_level = new_zoom_level;
						  return false;
					  });

	zoom_zero_action = 
		create_action("zoom-zero", 
					  null, 
					  "gtk-zoom-100", 
					  "<Control>0",
					  function ()
					  {
						  current_tab().webView.zoom_level = 1;

						  return false;
					  });

	about_action =
		create_action("about",
					  null,
					  "gtk-about", 
					  null, 
					  show_about);
	
	find_action = 
		create_action("find",
					  null, 
					  "gtk-find", 
					  null, 
					  show_find);
	
	add_bookmark_action =
		create_action("addbookmark",
					  "Add Bookmark",
					  "gtk-add",
					  "<Ctrl>B",
					  add_bookmark);
	
	// Someone needs to figure out how to use Tab in a key accel.
	/*cycle_tabs_action = new Gtk.Action({name:"cycletabs", label:"Cycle Through Tabs",
		                        tooltip:"Cycle Through Tabs"});
	cycle_tabs_action.set_accel_group(accels);
	cycle_tabs_action.connect_accelerator();
	actions.add_action_with_accel(cycle_tabs_action, "<Control><Tab>");
	cycle_tabs_action.signal.activate.connect(
		function ()
		{
			
		}
	);*/
	
	return accels;
}