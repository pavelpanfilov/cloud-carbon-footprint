/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useRemoteService } from '../../utils/hooks'
import useFilters from './FilterBar/utils/FilterHook'
import {
  MonthFilter,
  ServiceFilter,
  DateFilter,
  AccountFilter,
} from './FilterBar/Filters'
import ApexLineChart from './CloudUsage/ApexLineChart'
import CarbonIntensityMap from './CarbonIntensityMap'
import CarbonComparisonCard from './CarbonComparisonCard'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import moment, { unitOfTime } from 'moment'
import { Box, Card, CircularProgress, Grid } from '@material-ui/core'
import CloudProviderFilter from './FilterBar/Filters/CloudProviderFilter'
import { useFilterDataFromEstimates } from '../../utils/helpers'
import { FilterResultResponse } from '../../Types'
import NoDataMessage from '../../common/NoDataMessage'
import config from '../../ConfigLoader'

const PADDING_FILTER = 0.5
const PADDING_LOADING = 2

const useStyles = makeStyles((theme) => ({
  boxContainer: {
    padding: theme.spacing(3, 10),
    marginTop: 62,
  },
  filterHeader: {
    top: 0,
    left: 'auto',
    position: 'fixed',
    marginTop: '64px',
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    zIndex: 1199,
    padding: '9px 10px 7px 10px',
  },
  filterContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filter: {
    resize: 'none',
    padding: '2px 4px 0 4px',
    marginRight: theme.spacing(PADDING_FILTER),
    minWidth: '240px',
  },
  filterContainerSection: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  gridItemCards: {
    width: '50%',
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  loadingMessage: {
    padding: theme.spacing(PADDING_LOADING),
    fontSize: '24px',
  },
  noData: {
    height: '500px',
    fontWeight: 900,
    fontSize: '24px',
  },
}))

export default function EmissionsMetricsPage(): ReactElement {
  const classes = useStyles()

  const dateRangeType: string = config().DATE_RANGE.TYPE
  const dateRangeValue: string = config().DATE_RANGE.VALUE
  const endDate: moment.Moment = moment.utc()
  let startDate: moment.Moment
  if (config().PREVIOUS_YEAR_OF_USAGE) {
    startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
  } else {
    startDate = moment
      .utc()
      .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
  }

  const { data, loading } = useRemoteService([], startDate, endDate)

  const filteredDataResults: FilterResultResponse =
    useFilterDataFromEstimates(data)
  const { filteredData, filters, setFilters } = useFilters(
    data,
    filteredDataResults,
  )
  return loading ? (
    <Grid
      container
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '100vh' }}
    >
      <CircularProgress size={100} />
      <div className={classes.loadingMessage} id="loading-screen">
        Loading cloud data. This may take a while...
      </div>
    </Grid>
  ) : (
    <>
      <div className={classes.filterHeader}>
        <Grid item xs={12}>
          <div className={classes.filterContainer}>
            <div className={classes.filterContainerSection}>
              {[CloudProviderFilter, AccountFilter, ServiceFilter].map(
                (FilterComponent, i) => (
                  <div key={i} className={classes.filter}>
                    <FilterComponent
                      filters={filters}
                      setFilters={setFilters}
                      options={filteredDataResults}
                    />
                  </div>
                ),
              )}
            </div>
            <div className={classes.filterContainerSection}>
              {[DateFilter, MonthFilter].map((FilterComponent, i) => (
                <div key={i} className={classes.filter}>
                  <FilterComponent
                    filters={filters}
                    setFilters={setFilters}
                    options={filteredDataResults}
                  />
                </div>
              ))}
            </div>
          </div>
        </Grid>
      </div>
      <div className={classes.boxContainer}>
        <Grid container>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card style={{ width: '100%', height: '100%' }}>
                <Box padding={3} paddingRight={4}>
                  {filteredData.length ? (
                    <ApexLineChart data={filteredData} />
                  ) : (
                    <div className={classes.noData}>
                      <p>Cloud Usage</p>
                      <NoDataMessage isTop={true} />
                    </div>
                  )}
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Grid
                container
                spacing={3}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap-reverse',
                }}
              >
                <Grid item className={classes.gridItemCards}>
                  <CarbonComparisonCard data={filteredData} />
                </Grid>
                <Grid item className={classes.gridItemCards}>
                  <EmissionsBreakdownCard data={filteredData} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <CarbonIntensityMap />
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  )
}
