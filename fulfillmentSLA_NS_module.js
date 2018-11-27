/**
 * fulfillmentSLA.js
 * @author Tanner Smith (tannersmith2@gmail.com)
 * @description This script handles all funcitonality with the Fulfillment SLA
 * @NApiVersion 2.x
 */

define(['N/log'],function(log){
    
	/*
	 * @type: Object
	 * @description: Holds the constants for when different Sales Channels have
	 * their cutoffs for sales/fulfillment
	 */
	var CUTOFFS = {
			'wholesale'	: 20,
			'retail'	: 15
	};
	/*
	 * @type: Integer
	 * @description: The offset in hours from EDT to UTC
	 * Note: this is not EST!  But specifically EDT per requirements
	 */
	var UTC_EDT_OFFSET = 4;
	
	/*
	 * @type: Date
	 * @description: date that the order was placed 
	 */
	var oderDate = new Date();
	
	/**
	 * @description - This function returns a UTC Timestamp for when the order will be fulfilled
	 * @param salesChannel {string} - The string value representing which sales channel the order came from
	 * @param location {string} - The 2 digit country code for the location of the sale, 
	 * 					this determines which fulfillment center will be handling the order
	 * @return {string} - String of the UTC Date for expected fulfillment.
	 */
	function setExpectedFulfillmentTimestamp(salesChannel, location) {
		// just for logging purposes
		var where = "calculateRecurringRevenueChange";
		
		/*
		 * @type: Boolean
		 * @description: Defines whether this order made the cutoff for next day fulfillment
		 */
		var madeCutoff = saleMadeCutoff(salesChannel);
		
		/*
		 * @type: date
		 * @description: The next business date, considering Cutoff, which is when we can expect fulfillment.
		 */
		var expectedFulfillmentDate = calculateNextBusinessDate(madeCutoff, location);
		
		// Setting the expected fulfillment date to the correct hour.
		expectedFulfillmentDate.setUTCHours(CUTOFFS[salesChannel.toLowerCase()]+UTC_EDT_OFFSET,0,0,0);
		
		return expectedFulfillmentDate.toUTCString();
	}
	
	/**
	 * @description - Function checks the Time of the Order against the cutoff times for specific sales 
	 * 				channels to see if they made the cutoff for next day fulfillment
	 * @param salesChannel {string} - The string value representing which sales channel the order came from
	 * @return {boolean}
	 */
	function saleMadeCutoff(salesChannel) {
		var where = "saleMadeCutoff";
		
		// Taking the UTC hours, then subtracting the EDT offset to find the EDT Hour of the order
		var edtHr = orderDate.getUTCHours() - UTC_EDT_OFFSET;
		
		// If the hour of the order in EDT was on or after the cutoff hour return false
		if(edtHr >= CUTOFFS[salesChannel.toLowerCase()]){
			return false
		}
		
		return true;
	}
	
	/**
	 * @description - Function that looks at whether or not the order made the cutoff, and then 
	 * 				looks at the location of the order to determine the next Business Day for the 
	 * 				location of the fulfillment center.
	 * @param madeCutoff {boolean} - Signifies if the order made it in time for next day fulfillment
	 * @param location {string} - 2 digit country code for where this order will be fulfilled.
	 * @return {date}
	 */
	function calculateNextBusinessDate(madeCutoff, location){
		var where = "calculateNextBusinessDate";
		
		/*
		 * Days of the week are indexed 0-6
		 * defining which country works which days
		 */
		var workDays = {
				"CA":[1,2,3,4,5,6],
				"US":[1,2,3,4,5]
		};
		
		// If order made the cutoff, add 1 day, otherwise add 2
		var daysToAdd = madeCutoff?1:2;
		
		// Cloning the order date so we continue to have the original orderDate 
		var nextBusinessDate = new Date(orderDate.getTime());
		
		// Adding the days to the order
		nextBusinessDate.setDate(nextBusinessDate.getDate() + daysToAdd);
		
		// While the NextBusinessDate has a day that isnt in the workDays array
		// Add another day till we hit a business day
		while(workDays[location].indexOf(nextBusinessDate.getDay()) == -1){
			nextBusinessDate.setDate(nextBusinessDate.getDate() + 1);
		}
		
		// Return the next business day
		return nextBusinessDate;
	}
	
	
	return {
		setExpectedFulfillmentTimestamp	: setExpectedFulfillmentTimestamp
    }
});