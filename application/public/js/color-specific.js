<script>


		topCountries = [];
		theQueriedColor = {};

		<% for(var k=0; k < topCountries.length ;k++){ %>
			topCountries.push({key:'<%=topCountries[k].key%>', "freq": '<%=topCountries[k].freq %>', 'city': '<%=topCountries[k].city %>'})
		<%}%>

		theQueriedColor = {
			RrgbValue : <%= colorResult.RrgbValue%>,
			GrgbValue : <%= colorResult.GrgbValue%>,
			BrgbValue : <%= colorResult.BrgbValue%>,
		}

</script>