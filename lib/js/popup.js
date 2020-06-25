var c = console;

var cb = {
	url: localStorage.cbcUrl || null,
	orgKey: localStorage.orgKey || null,
	custApiId: localStorage.customApiId || null,
	custApiKey: localStorage.customApiKey || null
};

var getQueryHistory = function(cb, data) {
	// This takes the an object in the form of the body of the request
	// See the documentation for more examples
	//
	// Example data:
	// {
	//     start: '0',
	//     rows: '25',
	//     sort: [{
    //         field: 'archive_time',
    //         order: 'ASC'
	// 	   }]
	// }

	var url = [cb.url, 'livequery/v1/orgs', cb.orgKey, 'runs/_search'].join('/')

	$.ajax({
		url: url,
		type: 'post',
		data: JSON.stringify(data),
		headers: {
		    'Content-Type': 'application/json',
		    'X-Auth-Token': [cb.custApiKey, cb.custApiId].join('/')
		},
		dataType: 'json',
		success: function (data) {
		    $('#queryHistory').html('');

		    for (var query in data.results) {
		    	query = data.results[query];

		    	var scheduled = (query.schedule !== null);
		    	c.log(query, scheduled);

		    	$('#queryHistory').append([
					'<div class="card" data-scheduled="' + scheduled + '">',
						'<div class="card-header" id="heading-' + query.id + '">',
							'<h2 class="mb-0">',
								'<button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapse-' + query.id + '" aria-expanded="true" aria-controls="collapse-' + query.id + '">',
									'<div class="float-right">',
										(scheduled ? ' <img src="../../icons/clock.svg">' : ''),
									'</div>',

									query.name,
								'</button>',
							'</h2>',
						'</div>',
						'<div id="collapse-' + query.id + '" class="collapse" aria-labelledby="heading-' + query.id + '" data-parent="#queryHistory" data-results="' + [query.total_results, query.match_count, query.success_count, query.in_progress_count, query.error_count].join('|')  + '">',
							'<div class="card-body">',
								'<div class="d-flex justify-content-center">',
				                    '<div class="spinner-border text-primary" role="status">',
				                        '<span class="sr-only">Loading...</span>',
				                    '</div>',
				                '</div>',
							'</div>',
						'</div>',
					'</div>'
			    ].join (''));
		    }

			// Hide the schedules queries if the box is checked
			if (localStorage.showScheduled !== 'true') {
				$('[data-scheduled="true"]').hide();
			}

		    // Handle when a query is expanded
		    $('#queryHistory .collapse').on('show.bs.collapse', function() {
				var queryId = this.id.split('-')[1];
				getQueryResults(cb, queryId);

				// Disable scrolling in the main window
				$('.container').css({ overflow: 'hidden' });

				// Scroll to the query selected
				location.href = '#';
				location.href = '#heading-' + queryId;
			});

		    // Handle when a query is collapsed
		    $('#queryHistory .collapse').on('hide.bs.collapse', function() {
				$('.container').css({ overflow: 'auto' });
			});
		},
		error: function(data) {
			console.warn(data);

			$('#loadingContent').html([
				'<div class="alert alert-danger" role="alert">',
					'Invalid or missing configuration. Right click on the icon and select Options to configure the integration.',
				'</div>'
			].join(''));
		}
	});
};

var getQueryResults = function(cb, queryId) {
	var url = [cb.url, 'livequery/v1/orgs', cb.orgKey, 'runs', queryId, 'results/_search'].join('/'),
		data = { rows: 10000, start: 0 };


	$.ajax({
		url: url,
		type: 'post',
		data: JSON.stringify(data),
		headers: {
		    'Content-Type': 'application/json',
		    'X-Auth-Token': [cb.custApiKey, cb.custApiId].join('/')
		},
		dataType: 'json',
		success: function (data) {
	    	// This table is iterated on and build through the rest of this function, and output as the query results in the popup
	    	
	    	var dataResults = $('#collapse-' + queryId).data('results').split('|');


	    	// Create the basic framework for the table. This is the table, and 3 headers that will always be present
	    	$('#collapse-' + queryId).html([
				'<div class="progress">',
					'<div class="progress-bar" role="progressbar" aria-valuenow="' + dataResults[1] + '" aria-valuemin="0" aria-valuemax="' + dataResults[0] + '"></div>',
					// '<div class="progress-bar bg-success" role="progressbar" aria-valuenow="' + dataResults[2] + '" aria-valuemin="0" aria-valuemax="' + dataResults[0] + '"></div>',
					// '<div class="progress-bar bg-info" role="progressbar" aria-valuenow="' + dataResults[3] + '" aria-valuemin="0" aria-valuemax="' + dataResults[0] + '"></div>',
					// '<div class="progress-bar bg-danger" role="progressbar" aria-valuenow="' + dataResults[4] + '" aria-valuemin="0" aria-valuemax="' + dataResults[0] + '"></div>',
				'</div>',

	    		'<table class="table table-striped table-bordered table-hover table-sm">',
	    			'<thead>',
	    				'<tr>',
	    					'<th>Response</th>',
	    					'<th>Device</th>',
	    					'<th>Time</th>',
    					'</tr>',
					'</thead>',
					'<tbody></tbody>',
	    		'</table>'
			].join(''));

			$('#collapse-' + queryId + ' .progress-bar').each(function(e, el) {
			    var percent = Math.round($(el).attr('aria-valuenow') / $(el).attr('aria-valuemax') * 100);
			    $(el).css({ 'width': percent + '%' });
			});

		    var results = data.results;

	    	// Create the headers remaining headers
	    	for (var field in results[0].fields) {
	    		$('#collapse-' + queryId + ' table>thead>tr').append([
	    			'<th>',
	    				field.capitalize(),
    				'</th>'
    			].join(''));
	    	}

		    // Create the rows for each device
		    // !! need to change timestamp format (emulate console)
		    for (var i in results) {
		    	result = results[i];

		    	var row = [
	    			'<td>' + result.status.toUpperCase() + '</td>',
	    			'<td>' + result.device.name.toUpperCase() + '</td>',
	    			'<td>' + result.time_received + '</td>'
	    		];

		    	c.log('fields', Object.keys(result.fields).length);
		    	if (Object.keys(result.fields).length === 0) {
	    			var cellCount = $('#collapse-' + queryId + ' table th').length -3;
	    			row.push('<td colspan="' + cellCount + '"></td>');
		    	} else {
			    	for (var field in result.fields) {
		    			row.push([
		    				'<td>',
		    					(result.fields[field] ? result.fields[field] : 'none'),
		    				'</td>'
	    				].join(''));
		    		}
		    	}

	    		// Identify row color
	    		// Add new cases to the switch using these colors: https://getbootstrap.com/docs/4.5/content/tables/#contextual-classes
	    		var rowColor = '';
	    		switch(result.status) {
	    			case 'error':
	    				rowColor = 'warning';

    				default:
    					rowColor = (rowColor === '' ? rowColor : ' class="table-' + rowColor + '"');
	    		}

	    		$('#collapse-' + queryId + ' table>tbody').append([
		    		'<tr' + rowColor + '>',
		    			row.join(''),
		    		'</tr>'
    			].join(''));

		    }

			$('#collapse-' + queryId + ' table').DataTable();

		},
		error: function(data) {
			console.warn(data.status);
			if (data.status === 410) {
				$('#collapse-' + queryId + ' .card-body').html([
					'<div class="alert alert-warning" role="alert">',
						'The results of this scan are no longer available.',
					'</div>'
				].join(''));
			}
		}
	});
};


// from StackOverflow (https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript)
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).ready(function() {
	var width = '800px',
		height = '600px';

	$('body').css({
		width: width,
		height: height,
		overflow: 'hidden'
	});

	$('.container').css({
		'max-width': width,
		height: height,
		overflow: 'auto'
	});

	if (localStorage.showScheduled === 'true') {
		$('#showScheduled').prop('checked', true);
	} else {
		$('#showScheduled').prop('checked', false);
	}

	$('#showScheduled').change(function() {
		if (this.checked) {
			$('[data-scheduled="true"]').show();
			localStorage.showScheduled = true;
		} else {
			$('[data-scheduled="true"]').hide();
			localStorage.showScheduled = false;
		}
	});

	getQueryHistory(cb, {
	    start: '0',
	    rows: '50',
	    sort: [{
			field: 'archive_time',
			order: 'ASC'
		}]
	});
});
