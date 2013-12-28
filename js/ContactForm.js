var ContactForm = {

	element:null,
	container:null,

	init: function(){

		var self = this;
		this.element = $(".contact");
		this.container = this.element.find(".contactInfo");
		this.nameInput = this.element.find( "input[type=text]" );
		this.textInput = this.element.find( "textarea" );
		this.container.append( this.getErrorMsg() );
		this.emailToField = $("#frmcontactForm-emailTo");
		this.emailNotice = this.element.find( ".email-notice" );

		this.submitBtn = this.element.find( "input[type=submit]" );
		this.submitBtn.on( "click", function( evt ) {

			evt.preventDefault();

			var valid = self.validateForm( self.nameInput, self.textInput );
			if( valid && self.emailToField.val() ) self.submitForm( self.nameInput.val(), self.emailToField.val(), self.textInput.val() );

		});

		this.switchToLanguage();
	},

	switchToLanguage: function() {

		this.element.find("input:text").attr("placeholder",texts["Jméno"]);
		this.element.find("textarea").attr("placeholder",texts["Zpráva"]);
		this.element.find("input:submit").attr("value",texts["ODESLAT"]);

	},

	update:function( data ) {

		//console.log( "contactform", data );
		this.container.empty();
		
		if( Application.zoomLevel > 0 ) {
			var notice = "";
			if( appLanguage == "cz" ) {
				notice = "Pokud chcete žádat o informace na základě zák. 106/1999 Sb. o svobodném přístupu k informacím, návod naleznete na stránkách ";
				notice += "<a href='http://www.otevrete.cz/zadosti-o-informace/' target='_blank'><b style='color:#ffde00'>Otevřete.cz</b></a> při Otevřené společnosti, o.p.s.<p>"
			} else {
				notice = "If you wish to request information under the Freedom of Information Act. (No. 106/1999) from the police, instructions can be found ";
				notice += "<a href='http://www.otevrete.cz/en/' target='_blank'><b style='color:#ffde00'>HERE</b></a><p>"
			}

			var $html = $( "<div><b>" + data.name + "</b><br /><br />" + 
				data.contact_address + "<br /><br />tel: " + data.contact_phone + "<br />fax: " + data.contact_fax +
				"<br /><br />email:<br /><span class='mail'>" + data.contact_mail + "</span><br /><br />"
				+ notice +"</div>" );

			this.element.find("textarea").attr("rows", 13);
			this.container.append( $html );
			//this.emailToField.val( "zdenek.hynek@gmail.com" );
			this.emailToField.val( data.contact_mail );

		} else {

			var $html = $( "<div>" + texts["czech-republic-level-contact-notice"] + "</div>" );
			this.container.append( $html );

			this.emailToField.val("");

		}

		
	},

	validateForm: function( nameInput, messageInput ) {

		var valid = true;

		if( messageInput.val().length > 0 ) {
			messageInput.removeClass( "error" );
		} else {
			valid = false;
			messageInput.addClass( "error" );
		}

		return valid;
	},

	submitForm: function( name, emailTo, message ) {

		console.log( "submitForm " );
		var queryurl = "?do=submitContact";
		var self = this;

		$.ajax( {
			url: queryurl,
			type: "POST",
			data: { name: name,
					emailTo: emailTo,
					message: message },
			success:function( d ) {

				console.log( "success" );

				self.emailNotice.show();
				self.emailNotice.text( texts["e-mail-success"] );		
			},
			error: function( xhr ) {
				console.log( "xhr" );
				console.log( xhr );

				self.emailNotice.show();
				self.emailNotice.text( texts["e-mail-error"] );	
			}
		});

	},

	show: function() {
		if( this.element ) this.element.show();
	},

	hide: function() {
		if( this.element ) this.element.hide();
	},

	updateZoomLevel: function() {
		this.container.empty();
		this.container.append( this.getErrorMsg() );
		this.emailToField.val( "" );
	},

	getErrorMsg:function() {
		var msg = texts["Pro kontaktní informace vyber kraj v mapě."];
		if( Application.zoomLevel == 2 ) msg = texts["Pro kontaktní informace vyber odbor v mapě."];
		else if( Application.zoomLevel == 3 ) msg = texts["Pro kontaktní informace vyber oddělení v mapě."];
	
		return msg;
	}

}
