/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/log', 'N/record', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const UNBILLED_REVENUE_ACCOUNT_ID=720;
        const REVENUE_ACCOUNT_ID=202;
        const COG_SUB_INT_ID=5;
        const NVE_SUB_INT_ID=1;
        const TRE_SUB_INT_ID=3;
        const TFP_SUB_INT_ID=6;

        const execute = (scriptContext) => {
            
            var mySearch = search.load({ id: 3859 });
            
            
            mySearch.run().each(function(result) {
              try {  
                var recordId = result.getValue({ name: 'internalid' });
                log.debug('PB ID: ', recordId);
                var tranAmount = result.getValue({ name: 'amountunbilled'});
                log.debug('amount: ', tranAmount);
                var tranSub = result.getValue({ name: 'subsidiary'});
                var tranClass = result.getValue({ name: 'class'});
                var tranProj = result.getValue({ name: 'custbody_so_project'});
                var tranLoc = result.getValue({ name: 'location'});
                var tranDate = new Date();
                var recordType = result.recordType;
                
                    
                    
                    var unbilledJournal = record.create({
                        type: record.Type.JOURNAL_ENTRY,
                        isDynamic: true,
                        
                      });
            
                      unbilledJournal.setValue({ fieldId: 'subsidiary', value: tranSub });
                      unbilledJournal.setValue({ fieldId: 'trandate', value: tranDate });
                      unbilledJournal.setValue({ fieldId: 'approved', value: true });
                      
                      const subDepLookup = {
                        5: 29,
                        1: 3,
                        3: 13,
                        6: 36,
                      }
                      
                      const subDep = subDepLookup[tranSub] || 3;
                      
                      unbilledJournal.selectNewLine({sublistId: 'line'});
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: UNBILLED_REVENUE_ACCOUNT_ID
                      });
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'debit',
                        value: tranAmount
                      });
                      if (tranProj) {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: tranProj
                      });
                    } else {
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: ''
                      });
                    }
                      log.debug('Entity: ', tranProj);
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: subDep
                      });
                      if (!tranLoc && tranSub == TRE_SUB_INT_ID) {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: 3
                      });
                      log.debug('Location: ', 'Treehouse record. Location ID: 3');
                    } else {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: tranLoc
                      });
                      log.debug('Location: ', tranLoc);
                    }
                      
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        value: tranClass
                      });
                      unbilledJournal.commitLine({sublistId: 'line'});

                      unbilledJournal.selectNewLine({sublistId: 'line'});
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'account',
                        value: REVENUE_ACCOUNT_ID
                      });
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'credit',
                        value: tranAmount
                      });
                      if (tranProj) {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: tranProj
                      });
                    } else {
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'entity',
                        value: ''
                      });
                    }
                      
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'department',
                        value: subDep
                      });
                      if (!tranLoc && tranSub == TRE_SUB_INT_ID) {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: 3
                      });
                    } else {
                        unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'location',
                        value: tranLoc
                      });
                    }
                      unbilledJournal.setCurrentSublistValue({
                        sublistId: 'line',
                        fieldId: 'class',
                        value: tranClass
                      });
                      unbilledJournal.commitLine({sublistId: 'line'});


            
                      var journalId = unbilledJournal.save();
                      log.debug('JE Created :', journalId);

                      record.submitFields({
                        type:record.Type.JOURNAL_ENTRY,
                        id:journalId,
                        values:{
                            'custbody_unbilled_pb_backlink':recordId,
                            
                        }
                    });


                      record.submitFields({
                        type:record.Type.SALES_ORDER,
                        id:recordId,
                        values:{
                            'custbody_unbilled_revenue_je':journalId,
                            
                        }
                    });

                    



                } catch (e) {
                    log.error('Error Updating Record', 'ID: ' + recordId + ', Error: ' + e.message + ', Stack: ' + e.stack);
                }
                return true;
            });
        }

        return {execute}

    });
